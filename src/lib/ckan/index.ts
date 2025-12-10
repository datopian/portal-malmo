import CKAN from "@/lib/ckan/api";

export const ckan = (DMS: string = process.env.NEXT_PUBLIC_DMS ?? "") => {
  if (!DMS) {
    throw new Error(
      "DMS URL is not defined. Please set the NEXT_PUBLIC_DMS environment variable."
    );
  }
  return new CKAN(DMS);
};
