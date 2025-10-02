import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/site-header";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { apiSections } from "@/constants/api-sections";

export const metadata: Metadata = {
  title: "is-kit • Docs",
  description: "Type-safe isXXX combinators and utilities",
  icons: {
    icon: "/iskit_favicon.png",
    shortcut: "/iskit_favicon.png",
    apple: "/iskit_favicon.png",
  },
  openGraph: {
    title: "is-kit • Docs",
    description: "Type-safe isXXX combinators and utilities",
    images: [
      {
        url: "/iskit_logo1.svg",
        alt: "is-kit logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/iskit_logo1.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <SidebarLayout sections={apiSections}>
            <main className="w-full pt-14">{children}</main>
          </SidebarLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
