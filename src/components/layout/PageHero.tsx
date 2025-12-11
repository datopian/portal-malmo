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
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const breadcrumbItems = breadcrumb.items??[];
  const t = useTranslations();
  return (
    <div
      className={cn(
        "pt-10 pb-8 bg-[#F6F6EF] border-gray-200 border-t border-b border-dashed",
        className
      )}
    >
      <Container className="">
        <div className="">
          {breadcrumb  && breadcrumbItems?.length>0 && !breadcrumb?.hide && (
            <Breadcrumb className="mb-2">
              <BreadcrumbList >
                <BreadcrumbItem>
                  <BreadcrumbLink asChild >
                    <Link href="/">{t("Site.homeTitle")}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems?.length > 0 && (
                  <BreadcrumbSeparator />
                )}
                {breadcrumb?.items?.map((item, index) => {
                  const isLast = index === (breadcrumbItems)?.length - 1;
                  return (
                    <React.Fragment key={item.href}>
                      <BreadcrumbItem className="max-w-[120px] sm:max-w-none">
                        <BreadcrumbLink asChild className="overflow-hidden text-ellipsis whitespace-nowrap block">
                          <Link href={item.href} className="">{item.title}</Link>
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
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              )}
              {description && (
                <h2 className="mt-2 text md:text-md text-gray-600 ">
                  <MarkdownRender content={description} />
                </h2>
              )}
            </div>
          )}
        </div>
        <div className="mt-2">{children}</div>
      </Container>
    </div>
  );
}
