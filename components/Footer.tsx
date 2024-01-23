import Link from "next/link";
import { PortableText } from "@portabletext/react";
export const Footer: React.FC<{footerContent: any}> = ({
  footerContent
}) => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="flex flex-col space-y-10 mt-10 p-10 bg-neutral-200 shadow-xl prose w-full max-w-none lg:flex-row lg:space-y-0 lg:space-x-10">
      <div className="flex-1 basis-1/3">
        <PortableText value={footerContent.column1} />
      </div>
      <div className="flex-1 basis-1/3">
        <PortableText value={footerContent.column2} />
      </div>
      <div className="flex-1 basis-1/3">
        <PortableText value={footerContent.column3} />
      </div>
    </footer>
  );
};
