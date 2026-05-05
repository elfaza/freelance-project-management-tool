import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPMT | Freelancer Project Management",
  description:
    "A project collaboration workspace for freelancers and their clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
