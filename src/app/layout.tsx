import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "House Expense Tracker",
  description: "Track household income, commitments, and spending together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
