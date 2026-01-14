import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const joinTermsWithOr = (terms: string[]) => {
  return terms.map((t: string) => `"${t}"`).join(" OR ");
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function formatDateToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const formatDateToHumanReadable = (timestamp: string) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    console.error("Invalid date format:", error);
    return "Unknown time";
  }
};

export function formatPrettyDate(
  isoString: string,
  locale: string = "en"
): string {
  const date = new Date(isoString);

  const day = date.getDate();
  const monthYear = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);

  const dayPart =
    locale.startsWith("en") ? addOrdinal(day) : String(day);

  return `${dayPart} ${monthYear}`;
}

function addOrdinal(day: number): string {
  const rem10 = day % 10;
  const rem100 = day % 100;

  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  if (rem10 === 1) return `${day}st`;
  if (rem10 === 2) return `${day}nd`;
  if (rem10 === 3) return `${day}rd`;
  return `${day}th`;
}

export const getApiCode = (
  url: string,
  language: "python" | "javascript",
  actionName: string = "package_show",
  id: string
) => {
  const languages = {
    python: `
    import urllib.request
    import json
    
    url = '${url}/api/3/action/${actionName}?id=${id}'
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(data)  # Display the fetched JSON data
    
    except urllib.error.URLError as error:
        print('Error fetching data:', error)  
    `,
    javascript: `
    const url = '${url}/api/3/action/${actionName}?id=${id}';
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          console.log(data);  // Display the fetched JSON data
        })
        .catch(error => {
          console.error('Error fetching data:', error);
      });`,
  };

  return languages[language];
};

export type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export async function fetchRetry(
  url: string,
  n: number,
  opts: NextFetchOptions = {}
): Promise<Response> {
  const abortController = new AbortController();
  const id = setTimeout(() => abortController.abort(), 30000);

  try {
    const res = await fetch(url, {
      signal: abortController.signal,
      ...opts,
    });

    clearTimeout(id);

    if (!res.ok && n > 0 && res.status >= 500) {
      return fetchRetry(url, n - 1, opts);
    }

    return res;
  } catch (error) {
    clearTimeout(id);

    if (n > 0) {
      return fetchRetry(url, n - 1, opts);
    }

    throw error;
  }
}

export async function fetchJsonRetry<T>({
  url,
  retries = 2,
  opts = {},
}: {
  url: string;
  retries?: number;
  opts: NextFetchOptions;
}): Promise<T> {
  const res = await fetchRetry(url, retries, opts);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const updateFrequencyValues = {    
    "UNKNOWN": "Unknown",
    "TRIENNIAL": "Triennial (every three years)",
    "BIENNIAL": "Biennial (every two years)",
    "ANNUAL": "Annual (every year)",
    "ANNUAL_2": "Semiannual (twice a year)",
    "ANNUAL_3": "Three times a year",
    "QUARTERLY": "Quarterly (every three months)",
    "BIMONTHLY": "Bimonthly (every two months)",
    "MONTHLY": "Monthly (once a month)",
    "MONTHLY_2": "Semimonthly (twice a month)",
    "BIWEEKLY": "Biweekly (every two weeks)",
    "MONTHLY_3": "Three times a month",
    "WEEKLY": "Weekly (once a week)",
    "WEEKLY_2": "Semiweekly (twice a week)",
    "WEEKLY_3": "Three times a week",
    "DAILY": "Daily (once a day)",
    "UPDATE_CONT": "Continuously updated",
    "IRREG": "Irregular",
    "OTHER": "Other",
    "DAILY_2": "Twice a day",
    "CONTINOUOUS": "Continuous",
    "NEVER": "Never",
    "QUADRENNIAL": "Quadrennial (every four years)",
    "QUINQUENNIAL": "Quinquennial (every five years)",
    "HOURLY": "Hourly (every hour)",
    "DECENNIAL": "Decennial (every ten years)",
    "BIHOURLY": "Bihourly (every two hours)",
    "TRIHOURLY": "Trihourly (every three hours)",
    "BIDECENNIAL": "Bidecennial (every twenty years)",
    "TRIDECENNIAL": "Tridecennial (every thirty years)",
    "WEEKLY_5": "Five Times A Week",
    "SEXENNIAL": "Sexennial",
    "15MIN": "Every Fifteen Minutes",
    "30MIN": "Every Thirty Minutes",
    "10MIN": "Every Ten Minutes",
    "1MIN": "Every Minute",
    "NOT_PLANNED": "Not Planned",
    "12HRS": "Every Twelve Hours",
    "5MIN": "Every Five Minutes",
    "CONT": "Continuous",
    "AS_NEEDED": "As Needed"
}