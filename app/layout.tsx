import type { Metadata } from "next";
import "./globals.css";
import "./masterplan.css";
import "./pages.css";
import "./auth-state.css";
import "./admin.css";
import "./admin-pages.css";
import "./admin-v2.css";
import "./admin-controls.css";

export const metadata: Metadata = {
  title: "FLR Wholesale",
  description: "Wholesale ordering, made simple.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
