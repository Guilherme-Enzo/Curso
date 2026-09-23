import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  FULL_CURRENCY,
  FULL_PRICE_CENTS,
  isApprovedOrder,
  isRevokedOrder,
  mercadoPagoRequest,
  paymentFromOrder,
  validateOrderAmount,
  validateWebhookSignature,
  type MercadoPagoOrder,
} from "@/lib/mercadoPago";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  if (!validateWebhookSignature(request, dataId)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body?.type && body.type !== "order") return NextResponse.json({ received: true });

  const orderId = dataId || body?.data?.id;
  if (!orderId || typeof orderId !== "string") return NextResponse.json({ received: true });

  try {
    const order = await mercadoPagoRequest<MercadoPagoOrder>(`/v1/orders/${encodeURIComponent(orderId)}`);
    const payment = paymentFromOrder(order);
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { orderId: order.id ?? orderId },
    });

    if (!transaction) return NextResponse.json({ received: true });

    const validReference = order.external_reference === transaction.externalReference
      && (order.currency_id ?? order.currency) === FULL_CURRENCY
      && validateOrderAmount(order);
    const approved = validReference && isApprovedOrder(order);
    const revoked = validReference && isRevokedOrder(order);

    await prisma.$transaction(async (db) => {
      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          paymentId: payment?.id ?? transaction.paymentId,
          status: validReference ? (payment?.status ?? order.status ?? "unknown") : "invalid",
          statusDetail: payment?.status_detail ?? order.status_detail ?? null,
          purchasedAt: approved ? (transaction.purchasedAt ?? new Date()) : transaction.purchasedAt,
          refundedAt: revoked ? (transaction.refundedAt ?? new Date()) : transaction.refundedAt,
        },
      });

      const validPurchases = await db.paymentTransaction.count({
        where: {
          userId: transaction.userId,
          status: "processed",
          refundedAt: null,
          amountCents: FULL_PRICE_CENTS,
          currency: FULL_CURRENCY,
        },
      });
      await db.user.update({
        where: { id: transaction.userId },
        data: validPurchases > 0
          ? { plan: "FULL", refundedAt: null }
          : { plan: "FREE", refundedAt: revoked ? new Date() : undefined },
      });
    });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ error: "Falha ao processar notificação" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
