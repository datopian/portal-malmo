"use client";

import Container from "../ui/container";
import { Link, usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import { List } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // now locale-stripped: "/search", "/organizations", etc.
  const t = useTranslations();

  const menu = [
    { href: "/", label: `🏠 ${t("Site.homeTitle")}` },
    { href: "/search", label: `🧾 ${t("Common.search")}` },
    { href: "/organizations", label: `🏛️ ${t("Common.organizations")}` },
    { href: "/groups", label: `📁 ${t("Common.groups")}` },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // highlight for subroutes too, e.g. /organizations/foo
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="text-lg relative z-10 bg-[#f0f9ff]">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-[700] py-5"
            >
              <span>City of Malmö</span>
            </Link>
            <div className="ml-auto lg:hidden">
              <LanguageSwitcher />
            </div>
            <div className="lg:hidden ">
              <button
                className="flex items-center justify-center cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                aria-controls="navigation-menu"
              >
                <List />
              </button>
            </div>
          </div>

          <div
            id="navigation-menu"
            className={clsx(
              "lg:ml-auto overflow-hidden transition-all duration-500 lg:block",
              menuOpen ? "max-h-96" : "max-h-0",
              "lg:max-h-full lg:overflow-visible"
            )}
          >
            <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-8 relative top-[1px]">
              {menu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      isActive(item.href)
                        ? "text-foreground font-medium lg:border-b-2 border-foreground"
                        : "text-gray-600",
                      "hover:text-foreground transition-colors py-2 lg:py-5 block"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ml-4 hidden lg:block">
            <LanguageSwitcher />
          </div>
        </div>
      </Container>
    </header>
  );
}
