import { PortableText } from "@/sanity/lib/components";

interface CmsContent {
  content?: unknown;
}

export const CmsContent: React.FC<CmsContent> = ({ content }) => {
  if (!content) {
    return null;
  }
  return (
    <div className="prose my-4 w-full max-w-none bg-base-100 p-4 shadow-xl">
      <PortableText value={content} />
    </div>
  );
};
