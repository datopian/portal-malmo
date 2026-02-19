import createMiddleware from "next-intl/middleware";
import {routing} from "./i18n/routing";


export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

export const proxy = createMiddleware(routing)