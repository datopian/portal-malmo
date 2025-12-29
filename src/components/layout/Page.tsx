import Hero, { BreadcrumbProps } from "./PageHero";
import PageTabs, { PageTabItem } from "./PageTabs";
import Container from "../ui/container";
import { cn } from "@/lib/utils";
import React from "react";
import { Button, buttonVariants } from "../ui/button";
import { Link } from "@/i18n/navigation";

export type PageProps = {
  preTitle?: string;
  title: React.ReactNode | string;
  description?: string;
  breadcrumb?: BreadcrumbProps;
  metadata?: {
    title?: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }[];
  actions?: {
    title?: string;
    href?: string;
    icon?: React.ReactNode;
    target?: string;
    variant?: typeof buttonVariants;
    onClick?: () => void;
  }[];
  tabs?: PageTabItem[];
  children?: React.ReactNode;
  heroContent?: React.ReactNode;
  heroClass?: string;
};

export default function Page({
  preTitle,
  title,
  description,
  breadcrumb,
  tabs = [],
  actions,
  metadata,
  children,
  heroClass,
  heroContent,
}: PageProps) {
  return (
    <div>
      {(title || description || preTitle) && (
        <Hero
          breadcrumb={breadcrumb}
          preTitle={preTitle}
          title={title}
          description={description}
          className={`${cn(
            `relative ${tabs?.length > 0 ? "pb-[80px]" : ""}`,
            heroClass
          )}`}
        >
          <div className="space-y-2">
            {((metadata && metadata.length > 0) ||
              (actions && actions.length > 0)) && (
              <div className="flex flex-col gap-5 md:flex-row md:gap-10 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-x-4 gap-y-2 text-gray-600 text-sm">
                  {metadata?.map((data, i) => (
                    <div key={`${data.value}-${i}`}>
                      <span className="font-medium">{data.title}</span>{" "}
                      <>{data.value}</>
                    </div>
                  ))}
                </div>
                {actions && (
                  <div className="ms-auto">
                    {actions?.map((a, i) => (
                      <Button
                        asChild={a.href ? true : false}
                        key={`${a.title}-${i}`}
                        {...(a.onClick
                          ? {
                              onClick: a.onClick,
                            }
                          : null)}
                      >
                        {a.href ? (
                          <Link href={a.href} target="">
                            {a.title}
                          </Link>
                        ) : (
                          <>{a.title}</>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {heroContent && <div className="text-gray-600">{heroContent}</div>}
          </div>
        </Hero>
      )}
      {tabs?.length > 0 && (
        <Container className="relative ">
          <div className="-mt-[45px] w-full">
            <PageTabs contentClass="pt-5" items={tabs} />
          </div>
        </Container>
      )}
      {children && <section>{children}</section>}
    </div>
  );
}
