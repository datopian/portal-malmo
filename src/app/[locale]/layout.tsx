import { Rubik } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Suspense } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

const rubik = Rubik({
  weight: ["300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
});

type Params = { locale: string };

type LayoutProps = {
  params: Promise<Params>;
  children: React.ReactNode;
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locales } = routing;

  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${rubik.className} antialiased min-h-screen flex flex-col`}
      >
        <Suspense>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Header />
            <QueryProvider>
              <main className="flex-grow">{children}</main>
            </QueryProvider>
            <Footer />
          </NextIntlClientProvider>
        </Suspense>
      </body>
    </html>
  );
}

export async function generateMetadata(
  { params }: LayoutProps
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Site" });

  return buildLocalizedMetadata({
    locale,
    pathname: "/",              
    title: t("title"),
    description: t("description"),
  });
}