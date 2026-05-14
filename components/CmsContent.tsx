import { PortableText } from "@portabletext/react";

interface CmsContent {
  content?: any;
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
