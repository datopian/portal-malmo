"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Code, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ckan } from "@/lib/ckan";

const DMS = process.env.NEXT_PUBLIC_DMS ?? "";

function Snippet({
  title,
  value,
  copyLabel,
  className,
}: {
  title: string;
  value: string;
  copyLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore (clipboard may be blocked)
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium leading-tight">{title}</h4>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="h-8 w-8 shrink-0"
          aria-label={copyLabel}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="rounded-md border bg-muted/40">
        <pre className="max-w-full whitespace-pre-wrap break-all overflow-x-hidden p-3 text-sm leading-relaxed">
          <code className="font-mono text-foreground break-all">{value}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ApiDialog({
  id = "<id>",
  includeDatastore = false,
}: {
  id?: string;
  type?: "package" | "resource";
  includeDatastore?: boolean;
}) {
  const t = useTranslations();
  const [searchExampleData, setSearchExampleData] = React.useState<{
    column: string;
    value: string;
  }>({
    column: "<column>",
    value: "<value>",
  });

  const getExample = async () => {
    try {
      const records = await ckan().datastoreSearch(id, 1);
      const firstRecord = records?.[0];

      if (!firstRecord || typeof firstRecord !== "object") return;

      const isIdLikeKey = (key: string) => {
        const normalized = key.trim().toLowerCase();
        return (
          normalized === "id" ||
          normalized === "_id" ||
          normalized.endsWith("_id")
        );
      };

      const entries = Object.entries(
        firstRecord as Record<string, unknown>,
      ).filter(([key, value]) => {
        if (isIdLikeKey(key)) return false;
        if (value == null) return false;
        if (typeof value === "object") return false;
        return String(value).trim().length > 0;
      });

      if (!entries.length) return;

      const stringEntries = entries.filter(
        ([, value]) => typeof value === "string",
      );
      const pool = stringEntries.length ? stringEntries : entries;
      const [column, rawValue] = pool[Math.floor(pool.length / 2)];

      setSearchExampleData({
        column,
        value: String(rawValue).trim(),
      });
    } catch {}
  };

  const snippets = React.useMemo(() => {
    const base = DMS.replace(/\/$/, "");
    const rid = encodeURIComponent(id);

    return [
      {
        title: t("API.snippets.firstFiveResults"),
        value: `${base}/api/3/action/datastore_search?resource_id=${rid}&limit=5`,
      },
      {
        title: t("API.snippets.containsJones", {
          query: searchExampleData.value,
        }),
        value: `${base}/api/3/action/datastore_search?resource_id=${rid}&q=${searchExampleData.value}`,
      },
      {
        title: t("API.snippets.viaSql"),
        value: `${base}/api/3/action/datastore_search_sql?sql=${`SELECT * FROM "${id}" WHERE '${searchExampleData.column}' LIKE '%${searchExampleData.value}%'`}`,
      },
    ];
  }, [id, searchExampleData, t, searchExampleData]);

  const resourceMetadataSnippet = React.useMemo(() => {
    const base = DMS.replace(/\/$/, "");
    const rid = encodeURIComponent(id);
    return {
      title: t("API.snippets.resourceMetadata"),
      value: `${base}/api/3/action/resource_show?id=${rid}`,
    };
  }, [id, searchExampleData, t, searchExampleData]);

React.useEffect( ()=>{
  getExample();
},[] )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Code className="h-4 w-4" />
          {t("Common.api")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-auto z-[500] z-[500]">
        <DialogHeader>
          <DialogTitle className="text-left">{t("Common.api")}</DialogTitle>
          <DialogDescription className="text-foreground text-left">
            {t.rich("API.description", {
              link: (chunks) => (
                <Link
                  href="https://docs.ckan.org/en/latest/maintaining/datastore.html"
                  target="_blank"
                  className="underline text-theme-green font-medium"
                >
                  {chunks}
                </Link>
              ),
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 pr-2">
          <div className="space-y-2 pb-10" data-cy="api-tabs">
            <div className="rounded-lg  " data-cy="api-query-examples">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold"></h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {t("API.snippets.hint")}
                </span>
              </div>
              <div></div>
              
                <div className="space-y-4">
                  <Snippet
                    title={resourceMetadataSnippet.title}
                    value={resourceMetadataSnippet.value}
                    copyLabel={t("API.snippets.copySnippet")}
                  />
                 
                  {includeDatastore && snippets.map((s) => (
                    <Snippet
                      key={s.title}
                      title={s.title}
                      value={s.value}
                      copyLabel={t("API.snippets.copySnippet")}
                    />
                  ))}
                  
                </div>
             
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
