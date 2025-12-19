"use client";
import { cn } from "@/lib/utils";
import Container from "../ui/container";
import MarkdownRender from "../ui/markdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import homeGraphic from "@/assets/hero-home-bg.svg";
import navGraphic from "@/assets/hero-nav-bg.svg";
import useIsClamped from "@/hooks/clamped";
import { Button } from "../ui/button";

export type BreadcrumbItemProps = {
  title: string;
  href: string;
  current?:boolean;
};
export type BreadcrumbProps = {
  items?: BreadcrumbItemProps[];
  hide?: boolean;
};

export default function Hero({
  className,
  preTitle,
  title,
  description,
  children,
  breadcrumb = { items: [], hide: false },
  style = "navigation",
}: {
  className?: string;
  breadcrumb?: BreadcrumbProps;
  preTitle?: string;
  title?: React.ReactNode | string;
  description?: string;
  children?: React.ReactNode;
  style?: "home" | "navigation";
}) {
  const breadcrumbItems = breadcrumb.items ?? [];
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const { ref, isClamped } = useIsClamped([description, expanded]);
  return (
    <div
      className={cn(
        " bg-[#F6F6EF] border-gray-200 border-t border-b relative",
        className
      )}
    >
      <Container className="relative z-10">
        <div className="hidden lg:flex pointer-events-none absolute inset-y-0 right-0 top-0 w-3/4 align-end justify-end overflow-hidden">
          <Image
            src={style === "home" ? homeGraphic : navGraphic}
            alt=""
            className="object-contain object-right h-fit mt-auto"
            priority
          />
        </div>
        <div className={`relative py-[30px] ${ style === "home" ? "lg:py-[64px]" : "lg:py-12" } `}>
          {breadcrumb && breadcrumbItems?.length > 0 && !breadcrumb?.hide && (
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">{t("Site.homeTitle")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems?.length > 0 && <BreadcrumbSeparator />}
                {breadcrumb?.items?.map((item, index) => {
                  const isLast = index === breadcrumbItems?.length - 1;
                  return (
                    <React.Fragment key={item.href}>
                      <BreadcrumbItem className="max-w-[120px] sm:max-w-none">
                        <BreadcrumbLink
                          asChild
                          className="overflow-hidden text-ellipsis whitespace-nowrap block"
                        >
                          <Link href={item.href} className={item.current ? "text-theme-green font-semibold" : ""}>
                            {item.title}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {(preTitle || title || description) && (
            <div>
              {preTitle && (
                <span className="font-semibold text-sm text-gray-600 block ">
                  {preTitle}
                </span>
              )}
              {title && (
                <h1 className="text-3xl md:text-[40px] font-bold text-theme-green">
                  {title}
                </h1>
              )}
              {description && (
                <div className="mt-4">
                  <div
                    ref={ref}
                    className={[
                      "md:text-xl text-gray-600",
                      expanded ? "" : "line-clamp-5",
                    ].join(" ")}
                  >
                    <MarkdownRender content={description} />
                  </div>
                  {!expanded && isClamped && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setExpanded(true)}
                      className="mt-2 font-medium text-theme-green hover:underline underline p-0 cursor-pointer"
                    >
                      {t("Common.readMore")}
                    </Button>
                  )}
                  {expanded && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setExpanded(false)}
                      className="mt-2 font-medium text-theme-green hover:underline underline p-0 cursor-pointer"
                    >
                      {t("Common.readLess")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </Container>
    </div>
  );
}
