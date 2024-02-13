import { PortableText } from "@portabletext/react";

interface CmsContent {
  content?: any;
}

export const CmsContent: React.FC<CmsContent> = ({ content }) => {
  if (!content) return null;
  return (
    <div className="prose bg-base-100 p-4 my-4 w-full shadow-xl max-w-none">
      <PortableText value={content} />
    </div>
  );
};