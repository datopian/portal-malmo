"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

type Props = {
  url: string;
  resourceName: string;
  className?: string;
};

const INNERSCENE_URL = "https://www.innerscene.com";
const IFRAME_LOAD_DELAY_MS = 2000;
const IFRAME_LOAD_TIMEOUT_MS = 10000;
const supportedInnersceneLangs = [
  "en",
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
  const [iframeLoadError, setIframeLoadError] = React.useState(false);

  React.useEffect(() => {
    const localePath = getInnersceneLocalePath();

    setShowIframeLoader(true);
    setIframeLoaded(false);
    setIframeLoadError(false);
    setExternalViewerUrl(
      `${INNERSCENE_URL}${localePath}/tools/dwg-viewer?embedded=1&url=${encodeURIComponent(url)}`,
    );
  }, [url]);

  React.useEffect(() => {
    if (!externalViewerUrl || iframeLoadError) return;

    if (iframeLoaded) {
      const timer = window.setTimeout(() => {
        setShowIframeLoader(false);
      }, IFRAME_LOAD_DELAY_MS);

      return () => window.clearTimeout(timer);
    }

    const timeout = window.setTimeout(() => {
      setIframeLoadError(true);
      setShowIframeLoader(false);
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [externalViewerUrl, iframeLoaded, iframeLoadError]);

  const handleIframeError = React.useCallback(() => {
    setIframeLoadError(true);
    setShowIframeLoader(false);
  }, []);

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

        {iframeLoadError ? (
          <div className="flex aspect-video items-center justify-center p-4 text-center text-sm text-muted-foreground">
            {t("Preview.failedToLoadDwg")}
          </div>
        ) : (
          <iframe
            title={t("Preview.dwgPreviewLabel", { name: resourceName })}
            src={externalViewerUrl}
            className="w-full aspect-video border-0 min-h-[360px]"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
            onError={handleIframeError}
          />
        )}
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
