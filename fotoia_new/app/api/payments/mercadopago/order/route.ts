import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import {
  extractPixData,
  FULL_CURRENCY,
  FULL_PRICE_CENTS,
  FULL_PRICE,
  mercadoPagoRequest,
  paymentFromOrder,
  type MercadoPagoOrder,
} from "@/lib/mercadoPago";

type PaymentRequest = {
  method?: "pix" | "card";
  token?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  installments?: number;
  identificationType?: string;
  identificationNumber?: string;
};

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (user.role !== "student") {
    return NextResponse.json({ error: "Colaboradores e administradores já possuem acesso completo." }, { status: 400 });
  }
  if (user.plan === "FULL") {
    return NextResponse.json({ error: "Sua versão completa já está desbloqueada." }, { status: 409 });
  }

  let body: PaymentRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados de pagamento inválidos" }, { status: 400 });
  }

  const method = body.method;
  if (method !== "pix" && method !== "card") {
    return NextResponse.json({ error: "Escolha PIX ou cartão" }, { status: 400 });
  }

  const externalReference = `fotoia-${randomUUID()}`;
  const transaction = await prisma.paymentTransaction.create({
    data: {
      userId: user.id,
      externalReference,
      amountCents: FULL_PRICE_CENTS,
      currency: FULL_CURRENCY,
      status: "created",
    },
  });

  try {
    if (method === "card" && (!body.token || !body.paymentMethodId || body.paymentTypeId !== "credit_card")) {
      throw new Error("Dados do cartão incompletos");
    }

    const paymentMethod = method === "pix"
      ? { id: "pix", type: "bank_transfer" }
      : {
          id: body.paymentMethodId,
          type: body.paymentTypeId,
          token: body.token,
          installments: Number.isInteger(body.installments) && body.installments! > 0 ? body.installments : 1,
        };

    const order = await mercadoPagoRequest<MercadoPagoOrder>("/v1/orders", {
      method: "POST",
      headers: { "X-Idempotency-Key": transaction.id },
      body: JSON.stringify({
        type: "online",
        total_amount: FULL_PRICE,
        external_reference: externalReference,
        processing_mode: "automatic",
        transactions: { payments: [{ amount: FULL_PRICE, payment_method: paymentMethod }] },
        payer: {
          email: user.email,
          ...(body.identificationType && body.identificationNumber
            ? { identification: { type: body.identificationType, number: body.identificationNumber } }
            : {}),
        },
      }),
    });

    let finalOrder = order;
    if (method === "pix" && order.id && !extractPixData(order).qrCode) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        finalOrder = await mercadoPagoRequest<MercadoPagoOrder>(`/v1/orders/${order.id}`);
        if (extractPixData(finalOrder).qrCode) break;
      }
    }

    const payment = paymentFromOrder(finalOrder);
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        orderId: finalOrder.id ?? null,
        paymentId: payment?.id ?? null,
        status: payment?.status ?? finalOrder.status ?? "created",
        statusDetail: payment?.status_detail ?? finalOrder.status_detail ?? null,
      },
    });

    return NextResponse.json({
      orderId: finalOrder.id,
      status: finalOrder.status,
      statusDetail: finalOrder.status_detail,
      paymentStatus: payment?.status,
      pix: method === "pix" ? extractPixData(finalOrder) : null,
    }, { status: 201 });
  } catch (error) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "failed", statusDetail: error instanceof Error ? error.message.slice(0, 500) : "unknown_error" },
    }).catch(() => {});
    console.error("Mercado Pago order error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível iniciar o pagamento. Tente novamente.",
    }, { status: 502 });
  }
}
