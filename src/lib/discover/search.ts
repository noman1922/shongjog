import "server-only";

export function normalizeSearchQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function getSearchTerms(rawQuery: string) {
  const query = normalizeSearchQuery(rawQuery);
  const tokens = query.split(" ").filter((token) => token.length >= 2);
  const terms = new Set<string>();

  if (query.length >= 2) {
    terms.add(query);
  }

  tokens.forEach((token) => terms.add(token));

  if (query.includes("reactjs") || query.includes("react.js")) {
    terms.add("react");
  }

  if (tokens.includes("dev")) {
    terms.add("developer");
    terms.add("development");
  }

  if (tokens.includes("app")) {
    terms.add("application");
    terms.add("mobile");
  }

  if (query.includes("machine learning")) {
    terms.add("ml");
    terms.add("pytorch");
    terms.add("tensorflow");
  }

  if (query.includes("medical image")) {
    terms.add("image classification");
    terms.add("cnn");
    terms.add("computer vision");
  }

  return {
    patterns: Array.from(terms)
      .slice(0, 8)
      .map((term) => `%${term.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`),
    query,
    terms: Array.from(terms).slice(0, 8),
  };
}

export function buildIlikeOr(columns: string[], patterns: string[]) {
  return columns
    .flatMap((column) => patterns.map((pattern) => `${column}.ilike.${pattern}`))
    .join(",");
}

