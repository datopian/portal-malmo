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

const DMS = process.env.NEXT_PUBLIC_DMS ?? "";

function Snippet({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
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
        <h4 className="text-sm font-medium leading-tight">{title}</h4>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopy}
          className="h-8 w-8 shrink-0"
          aria-label="Copy snippet"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="rounded-md border bg-muted/40">
        <pre className="max-w-full whitespace-pre-wrap break-all overflow-x-hidden p-3 text-xs leading-relaxed">
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

  const snippets = React.useMemo(() => {
    const base = DMS.replace(/\/$/, "");
    const rid = encodeURIComponent(id);

    return [
      {
        title: t("API.snippets.firstFiveResults"),
        value: `${base}/api/3/action/datastore_search?resource_id=${rid}&limit=5`,
      },
      {
        title: t("API.snippets.containsJones"),
        value: `${base}/api/3/action/datastore_search?resource_id=${rid}&q=jones`,
      },
      {
        title: t("API.snippets.viaSql"),
        value: `${base}/api/3/action/datastore_search_sql?sql=${
          `SELECT * FROM "${id}" WHERE title LIKE '%jones%'`
        }`,
      },
    ];
  }, [id, t]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Code className="h-4 w-4" />
          {t("Common.api")}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] flex flex-col overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("Common.api")}</DialogTitle>
          <DialogDescription className="text-foreground">
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
            {includeDatastore && (
              <div className="rounded-lg  " data-cy="api-query-examples">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{t("API.snippets.title")}</h3>
                  <span className="text-xs text-muted-foreground">
                    {t("API.snippets.hint")}
                  </span>
                </div>

                <div className="space-y-4">
                  {snippets.map((s) => (
                    <Snippet key={s.title} title={s.title} value={s.value} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}
