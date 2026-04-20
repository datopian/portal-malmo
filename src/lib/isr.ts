import { envVars } from "./env";

export const DEFAULT_ISR_REVALIDATE_SECONDS = 150 as const;

export const ISR_REVALIDATE_SECONDS: number =
  Number(envVars.isrRevalidate) || DEFAULT_ISR_REVALIDATE_SECONDS;
