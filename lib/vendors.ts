export type VendorKey =
  | "amazon"
  | "walmart"
  | "office depot"
  | "staples"
  | "costco"
  | "sam's club"
  | "generic";

type VendorConfig = {
  label: string;
  buildUrl: (itemName: string) => string;
};

export const VENDORS: Record<VendorKey, VendorConfig> = {
  amazon: {
    label: "Amazon",
    buildUrl: (name) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(name)}`,
  },

  walmart: {
    label: "Walmart",
    buildUrl: (name) =>
      `https://www.walmart.com/search?q=${encodeURIComponent(name)}`,
  },

  "office depot": {
    label: "Office Depot",
    buildUrl: (name) =>
      `https://www.officedepot.com/catalog/search.do?query=${encodeURIComponent(
        name
      )}`,
  },

  staples: {
    label: "Staples",
    buildUrl: (name) =>
      `https://www.staples.com/search?query=${encodeURIComponent(name)}`,
  },

  costco: {
    label: "Costco",
    buildUrl: (name) =>
      `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(
        name
      )}`,
  },

  "sam's club": {
    label: "Sam's Club",
    buildUrl: (name) =>
      `https://www.samsclub.com/s/${encodeURIComponent(name)}`,
  },

  generic: {
    label: "Search Vendor",
    buildUrl: (name) =>
      `https://www.google.com/search?q=${encodeURIComponent(name)}`,
  },
};

/**
 * Normalize vendor input and return a usable config
 */
export function getVendorConfig(rawVendor?: string): VendorConfig {
  if (!rawVendor) return VENDORS.generic;

  const normalized = rawVendor.toLowerCase().trim();

for (const key in VENDORS) {
  if (normalized.includes(key)) {
    return VENDORS[key as VendorKey];
  }
}


return VENDORS.generic;


}