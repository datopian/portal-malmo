import { envVars } from "./env";

export const DEFAULT_MAX_PREVIEW_SIZE_BYTES = 524_288_000 as const; // 500 MB

export const MAX_PREVIEW_SIZE_BYTES: number =
  Number(envVars.maxPreviewSizeBytes) || DEFAULT_MAX_PREVIEW_SIZE_BYTES;
