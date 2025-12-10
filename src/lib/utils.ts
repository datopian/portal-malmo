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
