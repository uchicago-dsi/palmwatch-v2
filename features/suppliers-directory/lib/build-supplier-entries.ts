import type { SupplierEntry } from "../suppliers-directory-view";

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

interface MapEntry {
  groupHref?: string;
  label: string;
  ownerHref?: string;
}

export interface SupplierDirectoryModel {
  stats: { label: string; value: string }[];
  suppliers: SupplierEntry[];
}

export function buildSupplierDirectoryModel(searchList: {
  "Mill Owners": { label: string; href: string }[];
  "Mill Groups": { label: string; href: string }[];
}): SupplierDirectoryModel {
  const rawOwners = searchList["Mill Owners"];
  const rawGroups = searchList["Mill Groups"];
  const supplierMap = new Map<string, MapEntry>();

  for (const o of rawOwners) {
    supplierMap.set(normalize(o.label), { ownerHref: o.href, label: o.label });
  }

  for (const g of rawGroups) {
    const key = normalize(g.label);
    const existing = supplierMap.get(key);
    if (existing) {
      existing.groupHref = g.href;
      existing.label = g.label;
    } else {
      supplierMap.set(key, { groupHref: g.href, label: g.label });
    }
  }

  const suppliers: SupplierEntry[] = [...supplierMap.values()]
    .map(({ ownerHref, groupHref, label }): SupplierEntry => {
      if (ownerHref && groupHref) {
        return { label, type: "both", ownerHref, groupHref };
      }
      if (ownerHref) {
        return { label, type: "owner", href: ownerHref };
      }
      return { label, type: "group", href: groupHref ?? "" };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const stats = [
    { label: "Total suppliers", value: supplierMap.size.toLocaleString() },
    { label: "Mill owners", value: rawOwners.length.toLocaleString() },
    { label: "Corporate groups", value: rawGroups.length.toLocaleString() },
  ];

  return { suppliers, stats };
}
