import { Suspense } from "react";
import { Shop } from "@/components/portal/shop";

export const metadata = {
  title: "Wholesale catalogue",
  description: "Browse live FLR wholesale stock and place orders using your partner pricing.",
};

export default function WholesalePage() {
  return (
    <Suspense fallback={null}>
      <Shop />
    </Suspense>
  );
}
