"use client";

import Container from "../ui/container";
import { Link, usePathname } from "@/i18n/navigation";
import clsx from "clsx";
import {  Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const menu = [
    { href: "/data", label: `${t("Common.data")}` },
    { href: "/about-us", label: `${t("Common.aboutUs")}` },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="text-lg relative z-10 bg-white">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Link
              href="/"
              className="flex items-center gap-2 py-3 mr-3"
            >
              <Image src="/logo.svg" width={252} height={40} alt={t("Site.title")}/>
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
                <Menu />
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
            <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-8 relative ">
              {menu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      isActive(item.href)
                        ? "text-theme-green font-medium"
                        : "text-gray-600",
                      "hover:text-foreground transition-colors py-2 lg:py-3 block"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ml-6 hidden lg:block ">
            <LanguageSwitcher />
          </div>
        </div>
      </Container>
    </header>
  );
}
