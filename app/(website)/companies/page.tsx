import pageStyles from "@/components/page-layout.module.css";
import { emptySearchListPayload } from "@/domain";
import { loadSearchListPayload } from "@/lib/server/search-list-data";
import { CompaniesClient, type CompanyEntry } from "./companies-client";

export const revalidate = 60;

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export default async function Page() {
  const searchListRaw = await loadSearchListPayload();
  const searchList = searchListRaw ?? emptySearchListPayload;

  const rawOwners = searchList["Mill Owners"];
  const rawGroups = searchList["Mill Groups"];

  type MapEntry = { ownerHref?: string; groupHref?: string; label: string };
  const companyMap = new Map<string, MapEntry>();

  for (const o of rawOwners) {
    companyMap.set(normalize(o.label), { ownerHref: o.href, label: o.label });
  }

  for (const g of rawGroups) {
    const key = normalize(g.label);
    const existing = companyMap.get(key);
    if (existing) {
      existing.groupHref = g.href;
      existing.label = g.label; // prefer group label for display
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
    {
      label: "Total companies",
      value: companyMap.size.toLocaleString(),
    },
    {
      label: "Mill owners",
      value: rawOwners.length.toLocaleString(),
    },
    {
      label: "Corporate groups",
      value: rawGroups.length.toLocaleString(),
    },
  ];

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CompaniesClient companies={companies} stats={stats} />
      </div>
    </main>
  );
}
