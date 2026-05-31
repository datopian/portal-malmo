"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  TransformComponent,
  TransformWrapper,
  useTransformComponent,
} from "react-zoom-pan-pinch";

type Props = {
  url: string;
  resourceName: string;
  className?: string;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  wheelStep?: number;
};

export default function DwgPreview({
  url,
  resourceName,
  className,
  initialScale = 1,
  minScale = 0.75,
  maxScale = 8,
  wheelStep = 0.15,
}: Props) {
  const t = useTranslations();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [url]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <TransformWrapper
        key={url}
        initialScale={initialScale}
        minScale={minScale}
        maxScale={maxScale}
        centerOnInit
        centerZoomedOut
        limitToBounds={false}
        smooth={false}
        disablePadding
        wheel={{ step: wheelStep }}
        doubleClick={{ mode: "zoomIn" }}
        panning={{ velocityDisabled: true, allowLeftClickPan: true }}
        autoAlignment={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 border bg-background p-2">
              <div className="ml-auto flex items-center gap-2">
                <CurrentScaleLabel />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => zoomOut()}
                  aria-label={t("Preview.zoomOut")}
                >
                  &minus;
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => zoomIn()}
                  aria-label={t("Preview.zoomIn")}
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetTransform()}
                >
                  {t("Common.reset")}
                </Button>
              </div>
            </div>

            <div className="overflow-hidden border bg-background max-h-[85vh]">
              <figure className="min-h-[18rem] p-3">
                <figcaption className="sr-only">
                  {t("Preview.dwgPreviewLabel", { name: resourceName })}
                </figcaption>

                <div className="flex min-h-[16rem] items-center justify-center">
                  <img
                    src={url}
                    alt=""
                    aria-hidden="true"
                    className="hidden"
                    onLoad={() => {
                      setIsLoaded(true);
                      setHasError(false);
                    }}
                    onError={() => {
                      setHasError(true);
                      setIsLoaded(false);
                    }}
                  />

                  {isLoaded && !hasError && (
                    <TransformComponent
                      wrapperClass="!w-full !h-[75vh] !overflow-hidden !bg-white"
                      contentClass="!w-fit !h-fit !cursor-grab active:!cursor-grabbing"
                    >
                      <img
                        src={url}
                        alt={resourceName}
                        className={[
                          "block max-w-full h-auto border border-border bg-white shadow-sm select-none pointer-events-none",
                        ].join(" ")}
                        draggable={false}
                      />
                    </TransformComponent>
                  )}

                  {!isLoaded && !hasError && (
                    <div className="p-4 text-sm">{t("Common.loading")}</div>
                  )}

                  {hasError && (
                    <div className="p-4 text-sm">{t("Preview.failedToLoadDwg")}</div>
                  )}
                </div>
              </figure>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

function CurrentScaleLabel() {
  const scale = useTransformComponent((state) => state.state.scale);
  return <span className="w-14 text-center text-sm">{Math.round(scale * 100)}%</span>;
}
