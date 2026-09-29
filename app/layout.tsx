import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui";
import "./globals.css";
import "./tokens.css";
import "./masterplan.css";
import "./pages.css";
import "./auth.css";
import "./auth-extra.css";
import "./console.css";
import "./admin-legacy.css";

export const metadata: Metadata = {
  title: {
    default: "FLR Ltd. — Pharmaceutical Wholesale",
    template: "%s · FLR Ltd.",
  },
  description:
    "FLR Ltd. is a Kigali-based pharmaceutical and dermocosmetics wholesaler. Verified partners order online with confidential wholesale pricing, batch-traced stock and tracked delivery.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#10271b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
