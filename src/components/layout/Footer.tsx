import { getTranslations } from "next-intl/server";
import Container from "../ui/container";
import Link from "next/link";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="py-10 bg-theme-green text-theme-green-foreground">
      <Container className="grid gap-10 lg:gap-20 grid-2 lg:grid-cols-3">
        <div className="whitespace-pre-line">{t("Footer.note")}</div>
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {t("Footer.contactTitle")}
          </h2>
          <ul className="space-y-3">
            <li>
              <span className="font-semibold">{t("Common.email")}: </span>
              <Link
                href="mailto:malmostad@malmo.se"
                className="hover:underline"
              >
                malmostad@malmo.se
              </Link>
            </li>

            <li>
              <span className="font-semibold">{t("Common.address")}: </span>
              Malmö stad, 250 80 Malmö
            </li>
            <li>
              <span className="font-semibold">{t("Common.phone")}: </span>
              <Link
                href="tel:+46 40 341000"
                className="hover:underline"
              >
                +46 40 341000
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:text-right space-y-1 text-sm flex flex-col">
          <div className="flex items-center gap-1 md:justify-end">
            <span className="text-sm">{t("Footer.builtWith")}</span>
            <a
              className="flex flex-col md:flex-row items-center justify-end gap-1 "
              href="https://portaljs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span
                className={`font-extrabold text-white text-xl sm:text-lg ${roboto.className}`}
              >
                🌀 PortalJS
              </span>
            </a>
            <span>{t("Footer.onCKAN")}</span>
          </div>
          <p className="">{t("Footer.exportCatalog")}</p>
        </div>
      </Container>
    </footer>
  );
}
