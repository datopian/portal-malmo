"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

type Props = {
  url: string;
  resourceName: string;
  className?: string;
};

const INNERSCENE_URL = "https://www.innerscene.com";
const supportedInnersceneLangs = [
  "es",
  "fr",
  "de",
  "pt",
  "ja",
  "it",
  "sv",
  "el",
  "ar",
] as const;

type SupportedInnersceneLang = (typeof supportedInnersceneLangs)[number];

export default function DwgPreview({
  url,
  className,
  resourceName,
}: Readonly<Props>) {
  const t = useTranslations();
  const [externalViewerUrl, setExternalViewerUrl] = React.useState("");
  const [showIframeLoader, setShowIframeLoader] = React.useState(true);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);

  React.useEffect(() => {
    const localePath = getInnersceneLocalePath();

    setShowIframeLoader(true);
    setIframeLoaded(false);
    setExternalViewerUrl(
      `${INNERSCENE_URL}${localePath}/tools/dwg-viewer?embedded=1&url=${encodeURIComponent(url)}`,
    );
  }, [url]);

  React.useEffect(() => {
    if (!externalViewerUrl || !iframeLoaded) return;

    const timer = window.setTimeout(() => {
      setShowIframeLoader(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [externalViewerUrl, iframeLoaded]);

  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p>{t("Preview.externalPreviewInstructions")}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-sm border bg-background">
        {showIframeLoader && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3 px-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-theme-green" />
              <p className="text-sm text-muted-foreground">
                {t("Common.loading")}
              </p>
            </div>
          </div>
        )}

        <iframe
          title={t("Preview.dwgPreviewLabel", { name: resourceName })}
          src={externalViewerUrl}
          className="w-full aspect-video border-0"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          {t.rich("Preview.externalPreviewAttribution", {
            link: (chunks) => (
              <a
                href="https://www.innerscene.com/tools/dwg-viewer#faq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-green underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
}

function getInnersceneLocalePath() {
  const lang = getSupportedBrowserLanguage();
  return lang ? `/${lang}` : "";
}

function getSupportedBrowserLanguage(): SupportedInnersceneLang | "" {
  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const lang = browserLanguage
      ?.toLowerCase()
      .split("-")[0] as SupportedInnersceneLang | undefined;

    if (lang && supportedInnersceneLangs.includes(lang)) {
      return lang;
    }
  }

  return "";
}
