import { getTranslations } from "next-intl/server";
import Container from "../ui/container";
import { Linkedin } from "lucide-react";

export default async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="py-10 mt-10 bg-theme-green text-theme-green-foreground">
      <Container className=" grid gap-8 md:grid-cols-3 ">
         <div>
          <h2 className="text-2xl font-bold mb-4">{t("Common.aboutUs")}</h2>
          <ul className="space-y-3">
            <li>
              <a href="#" className="hover:underline">
                Vad är Öppen Data?
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Vad är öppen data?
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Ansök data
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Sekretesspolicy
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <ul className="space-y-3">
            <li>
              <a
                href="mailto:info@opendata.se"
                className="hover:underline break-all"
              >
                info@opendata.se
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Prenumerera på vårt nyhetsbrev
              </a>
            </li>
            <li>Öppen Data Malmö<br></br>Höck Kampmanns Plads 1<br></br>8000 Århus C</li>
      
            <li>
              <a href="#" className="hover:underline">
                Tillgänglighetsförklaring
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline flex items-center gap-1">
                <Linkedin width={18}/><span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 – Tech info */}
        <div className="md:text-right space-y-3">
          <div className="w-[180px] h-[64px] bg-white ml-auto"></div>
          <p>Built with PortalJS with CKAN backend</p>
          <p className="mt-2">
            Export DCAT catalog in RDF or JSON-LD
          </p>
        </div>
      </Container>
    </footer>
  );
}
