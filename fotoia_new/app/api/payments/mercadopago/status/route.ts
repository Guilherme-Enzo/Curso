import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { isApprovedOrder, mercadoPagoRequest, validateOrderAmount, type MercadoPagoOrder, FULL_CURRENCY } from "@/lib/mercadoPago";

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const transaction = await prisma.paymentTransaction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, orderId: true, externalReference: true, status: true, statusDetail: true, createdAt: true },
  });

  let plan = user.plan;
  if (transaction?.orderId && user.role === "student") {
    try {
      const order = await mercadoPagoRequest<MercadoPagoOrder>(`/v1/orders/${encodeURIComponent(transaction.orderId)}`);
      const valid = order.external_reference === transaction.externalReference
        && (order.currency_id ?? order.currency) === FULL_CURRENCY
        && validateOrderAmount(order);
      if (valid && isApprovedOrder(order)) {
        await prisma.$transaction([
          prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: { status: "processed", statusDetail: "accredited", purchasedAt: new Date() },
          }),
          prisma.user.update({ where: { id: user.id }, data: { plan: "FULL", refundedAt: null } }),
        ]);
        plan = "FULL";
      }
    } catch {
      // The webhook can complete the same reconciliation later.
    }
  }

  return NextResponse.json({ plan, transaction });
}
