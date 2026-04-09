import { getTranslations } from "next-intl/server";
import Container from "../ui/container";
import { Link } from "@/i18n/navigation";
import { Roboto } from "next/font/google";
import { envVars } from "@/lib/env";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="bg-theme-green py-10 text-theme-green-foreground">
      <Container className="grid grid-2 gap-10 lg:grid-cols-3 lg:gap-20">
        <div className="whitespace-pre-line">
          {t("Footer.note")}
          <div className="mt-6">
            <Link
              href="/accessibility-statement"
              className="flex items-center gap-1 underline transition hover:text-white"
            >
              {t("Footer.accessibilityStatement")}
            </Link>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">{t("Footer.contactTitle")}</h2>
          <ul className="space-y-3">
            <li>
              <span className="font-semibold">{t("Common.email")}: </span>
              <Link href="mailto:malmostad@malmo.se" className="hover:underline">
                malmostad@malmo.se
              </Link>
            </li>

            <li>
              <span className="font-semibold">{t("Common.address")}: </span>
              <span>Malmö stad, 250 80 Malmö</span>
            </li>
            <li>
              <span className="font-semibold">{t("Common.phone")}: </span>
              <Link href="tel:+46 40 341000" className="hover:underline">
                +46 40 341000
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-1 text-sm md:text-right">
          <div className="flex items-center gap-1 md:justify-end">
            <span className="text-sm">{t("Footer.builtWith")}</span>
            <a
              className="flex flex-col items-center justify-end gap-1 md:flex-row"
              href="https://portaljs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span
                className={`text-xl font-extrabold text-white sm:text-lg ${roboto.className}`}
              >
                PortalJS
              </span>
            </a>
            <span>{t("Footer.onCKAN")}</span>
          </div>
          <p>
            {t.rich("Footer.exportCatalog", {
              rdf: (chunks) => (
                <Link
                  href={`${envVars.dms}/catalog.rdf`}
                  target="_blank"
                  className="underline"
                >
                  {chunks}
                </Link>
              ),
              jsonld: (chunks) => (
                <Link
                  target="_blank"
                  href={`${envVars.dms}/catalog.jsonld`}
                  className="underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </Container>
    </footer>
  );
}
