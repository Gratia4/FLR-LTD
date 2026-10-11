import { Suspense } from "react";
import { OrdersView } from "@/components/portal/orders-view";

export const metadata = { title: "Orders" };

export default function ClientOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}
