type SupportedLanguage = "python" | "javascript" | "curl" | "r";
type SupportedLocale = "en" | "sv";
type SnippetTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type ApiCodeParams = {
  url: string;
  language: SupportedLanguage | (string & {});
  id: string;
  type?: "package" | "resource";
  datastoreAction?: "datastore_search" | "datastore_search_sql";
  limit?: number;
  offset?: number;
  sql?: string;
  includeDatastore?: boolean;
  locale?: string;
  t?: SnippetTranslator;
};

type SnippetI18n = {
  metadataTitle: string;
  resourceDataTitle: string;
  queriesTitle: string;
  firstFiveResults: string;
  containsJones: string;
  viaSql: string;
};

const SNIPPET_I18N: Record<SupportedLocale, SnippetI18n> = {
  en: {
    metadataTitle: "Metadata",
    resourceDataTitle: "Resource data",
    queriesTitle: "Queries",
    firstFiveResults: "Example query (first five results):",
    containsJones: 'Example query (results containing "jones"):',
    viaSql: "Example query (via SQL statement):",
  },
  sv: {
    metadataTitle: "Metadata",
    resourceDataTitle: "Resursdata",
    queriesTitle: "Fragor",
    firstFiveResults: "Exempelfraga (forsta fem resultaten):",
    containsJones: 'Exempelfraga (resultat som innehaller "jones"):',
    viaSql: "Exempelfraga (via SQL-sats):",
  },
};

function normalizeLocale(locale?: string): SupportedLocale {
  return locale?.toLowerCase().startsWith("sv") ? "sv" : "en";
}

function getSnippetText(locale?: string, t?: SnippetTranslator): SnippetI18n {
  const fallback = SNIPPET_I18N[normalizeLocale(locale)];

  if (!t) return fallback;

  return {
    metadataTitle: t("API.snippets.metadataTitle"),
    resourceDataTitle: t("API.snippets.resourceDataTitle"),
    queriesTitle: t("API.snippets.queriesTitle"),
    firstFiveResults: t("API.snippets.firstFiveResults"),
    containsJones: t("API.snippets.containsJones"),
    viaSql: t("API.snippets.viaSql"),
  };
}

function escapeForSingleQuotesInShell(value: string): string {
  return value.replace(/'/g, `'\\''`);
}

export const getApiCode = ({
  url,
  language,
  id,
  type = "package",
  datastoreAction = "datastore_search",
  limit = 10,
  offset = 0,
  sql,
  includeDatastore = false,
  locale,
  t,
}: ApiCodeParams): string => {
  const text = getSnippetText(locale, t);
  const actionName = `${type}_show`;
  const metadataUrl = `${url}/api/3/action/${actionName}?id=${encodeURIComponent(id)}`;
  const datastoreUrl = `${url}/api/3/action/${datastoreAction}`;

  const payload =
    datastoreAction === "datastore_search_sql"
      ? { sql: sql ?? `SELECT * FROM "${id}" LIMIT ${limit} OFFSET ${offset}` }
      : { id, limit, offset };

  const payloadJson = JSON.stringify(payload, null, 2);
  const includeDatastoreSnippet = includeDatastore;
  const varName = type === "package" ? "dataset" : type;

  const curlDatastoreSnippet = includeDatastoreSnippet
    ? `
# 2) ${text.resourceDataTitle}
curl -sS "${datastoreUrl}" -H "Accept: application/json" -H "Content-Type: application/json" -d '${escapeForSingleQuotesInShell(payloadJson)}'
`
    : "";

  const javascriptDatastoreSnippet = includeDatastoreSnippet
    ? `
// 2) ${text.resourceDataTitle}
const resourceDataUrl = "${datastoreUrl}";
const resourceDataPayload = ${payloadJson};
const resourceData = await fetch(resourceDataUrl, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(resourceDataPayload),
}).then(r => r.json());
console.log(resourceData);
`
    : "";

  const pythonDatastoreSnippet = includeDatastoreSnippet
    ? `
# 2) ${text.resourceDataTitle}
resourceDataUrl = "${datastoreUrl}"
resourceDataPayload = ${payloadJson}
resourceData = requests.post(
  resourceDataUrl,
  headers={"Accept": "application/json", "Content-Type": "application/json"},
  json=resourceDataPayload,
).json()
print(resourceData)
`
    : "";

  const rDatastoreSnippet = includeDatastoreSnippet
    ? `
# 2) ${text.resourceDataTitle}
resource_data_url <- "${datastoreUrl}"
resource_data_payload <- ${payloadJson}

res <- httr::POST(
  resource_data_url,
  httr::add_headers(
    Accept = "application/json",
    "Content-Type" = "application/json"
  ),
  body = jsonlite::toJSON(resource_data_payload, auto_unbox = TRUE),
  encode = "raw"
)

resource_data <- jsonlite::fromJSON(httr::content(res, as = "text"))
print(resource_data)
`
    : "";

  const snippets: Record<SupportedLanguage, string> = {
    curl: `
# 1) ${text.metadataTitle}
curl -sS "${metadataUrl}" -H "Accept: application/json"

${curlDatastoreSnippet}`.trim(),

    javascript: `
// 1) ${text.metadataTitle}
const ${varName}MedatadaUrl = "${metadataUrl}";
const ${varName}Medatada = await fetch(${varName}MedatadaUrl, {
  headers: { Accept: "application/json" },
}).then(r => r.json());
console.log(${varName}Medatada);

${javascriptDatastoreSnippet}`.trim(),

    python: `
import requests

# 1) ${text.metadataTitle}
${varName}MedatadaUrl = "${metadataUrl}"
${varName}Medatada = requests.get(
  ${varName}MedatadaUrl,
  headers={"Accept": "application/json"},
).json()
print(${varName}Medatada)

${pythonDatastoreSnippet}`.trim(),

    r: `
# 1) ${text.metadataTitle}
${varName}_metadata_url <- "${metadataUrl}"
${varName}_metadata <- jsonlite::fromJSON(${varName}_metadata_url)
print(${varName}_metadata)

${rDatastoreSnippet}`.trim(),
  };

  const normalized = String(language).toLowerCase();
  return snippets[(normalized as SupportedLanguage) ?? "curl"] ?? snippets.curl;
};
