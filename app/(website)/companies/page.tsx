import pageStyles from "@/components/page-layout.module.css";
import { emptySearchListPayload } from "@/domain";
import {
  buildCompanyDirectoryModel,
  CompaniesClient,
} from "@/features/companies-directory";
import { loadSearchListPayload } from "@/server/search-list-data";

export const revalidate = 60;

export default async function Page() {
  const searchListRaw = await loadSearchListPayload();
  const searchList = searchListRaw ?? emptySearchListPayload;
  const { companies, stats } = buildCompanyDirectoryModel(searchList);

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <CompaniesClient companies={companies} stats={stats} />
      </div>
    </main>
  );
}
