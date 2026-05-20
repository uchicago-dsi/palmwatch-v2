import pageStyles from "@/components/page-layout.module.css";
import { emptySearchListPayload } from "@/domain";
import {
  buildSupplierDirectoryModel,
  SuppliersClient,
} from "@/features/suppliers-directory";
import { loadSearchListPayload } from "@/server/search-list-data";

export const revalidate = 60;

export default async function Page() {
  const searchListRaw = await loadSearchListPayload();
  const searchList = searchListRaw ?? emptySearchListPayload;
  const { suppliers, stats } = buildSupplierDirectoryModel(searchList);

  return (
    <main className={pageStyles.pageShell}>
      <div className={pageStyles.pageInner}>
        <SuppliersClient stats={stats} suppliers={suppliers} />
      </div>
    </main>
  );
}
