import type { CompanyEntry } from "../companies-directory-view";

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

type MapEntry = { ownerHref?: string; groupHref?: string; label: string };

export type CompanyDirectoryModel = {
  companies: CompanyEntry[];
  stats: { label: string; value: string }[];
};

export function buildCompanyDirectoryModel(searchList: {
  "Mill Owners": { label: string; href: string }[];
  "Mill Groups": { label: string; href: string }[];
}): CompanyDirectoryModel {
  const rawOwners = searchList["Mill Owners"];
  const rawGroups = searchList["Mill Groups"];
  const companyMap = new Map<string, MapEntry>();

  for (const o of rawOwners) {
    companyMap.set(normalize(o.label), { ownerHref: o.href, label: o.label });
  }

  for (const g of rawGroups) {
    const key = normalize(g.label);
    const existing = companyMap.get(key);
    if (existing) {
      existing.groupHref = g.href;
      existing.label = g.label;
    } else {
      companyMap.set(key, { groupHref: g.href, label: g.label });
    }
  }

  const companies: CompanyEntry[] = [...companyMap.values()]
    .map(({ ownerHref, groupHref, label }): CompanyEntry => {
      if (ownerHref && groupHref) {
        return { label, type: "both", ownerHref, groupHref };
      }
      if (ownerHref) {
        return { label, type: "owner", href: ownerHref };
      }
      return { label, type: "group", href: groupHref! };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const stats = [
    { label: "Total companies", value: companyMap.size.toLocaleString() },
    { label: "Mill owners", value: rawOwners.length.toLocaleString() },
    { label: "Corporate groups", value: rawGroups.length.toLocaleString() },
  ];

  return { companies, stats };
}
