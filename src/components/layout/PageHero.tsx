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
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import heroBg from "@/assets/hero-home-bg.svg";

export type BreadcrumbItemProps = {
  title: string;
  href: string;
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
}: {
  className?: string;
  breadcrumb?: BreadcrumbProps;
  preTitle?: string;
  title?: React.ReactNode | string;
  description?: string;
  children?: React.ReactNode;
}) {
  const breadcrumbItems = breadcrumb.items ?? [];
  const t = useTranslations();
  return (
    <div
      className={cn(
        " bg-[#F6F6EF] border-gray-200 border-t border-b relative",
        className
      )}
    >
      <Container className="relative z-10">
        <div className="hidden lg:flex pointer-events-none absolute inset-y-0 right-0 top-0 w-3/4  justify-end ">
          <Image
            src={heroBg}
            alt=""
            className="h-full w-full object-cover object-right"
            priority
          />
        </div>
        <div className="relative py-[40px] lg:py-[64px]">
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
                          <Link href={item.href} className="">
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
                <h2 className="mt-4 md:text-xl text-gray-600 ">
                  <MarkdownRender content={description} />
                </h2>
              )}
            </div>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </Container>
    </div>
  );
}
