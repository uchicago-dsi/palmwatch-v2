import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@/sanity/lib/components";

export const revalidate = 60

export default async function Page() {
  const content = await cmsClient.getContactPage();
  return (
    <div className="prose max-w-3xl mx-auto py-4">
      <PortableText value={content.content} />
    </div>
  );
}
