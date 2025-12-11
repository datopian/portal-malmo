import { getTranslations } from "next-intl/server";
import Container from "../ui/container";
import { Linkedin } from "lucide-react";

export default async function Footer() {
  const t = await getTranslations();

  const footerLinks = [
    {
      title: t("Common.aboutUs"),
      items: [
        {
          label: t("Footer.whatIsOpenData1"),
          href: "#",
        },
        {
          label: t("Footer.requestData"),
          href: "#",
        },
        {
          label: t("Footer.privacyPolicy"),
          href: "#",
        },
      ],
    },
    {
      title: t("Footer.contactTitle"),
      items: [
        {
          label: "info@opendata.se", // usually not translated
          href: "mailto:info@opendata.se",
          className: "break-all",
        },
        {
          label: t("Footer.newsletter"),
          href: "#",
        },
        {
          label: t("Footer.address"),
          isText: true,
          className: "whitespace-pre-line",
        },
        {
          label: t("Footer.accessibilityStatement"),
          href: "#",
        },
        {
          label: "LinkedIn",
          href: "#",
          icon: <Linkedin width={18} />,
          className: "flex items-center gap-1",
        },
      ],
    },
  ];

  return (
    <footer className="py-10 bg-theme-green text-theme-green-foreground">
      <Container className="grid gap-8 md:grid-cols-3">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={`hover:underline ${item.className ?? ""}`}
                    >
                      {item.icon}
                      {item.icon ? <span>{item.label}</span> : item.label}
                    </a>
                  ) : (
                    <p className={item.className ?? ""}>{item.label}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:text-right space-y-3 text-sm">
          <div className="w-[180px] h-[64px] bg-white ml-auto" />
          <p>{t("Footer.builtWithPortaljs")}</p>
          <p className="mt-2">{t("Footer.exportCatalog")}</p>
        </div>
      </Container>
    </footer>
  );
}
