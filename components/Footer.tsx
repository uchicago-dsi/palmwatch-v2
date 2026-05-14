import { PortableText } from "@/sanity/lib/components";

export const Footer: React.FC<{ footerContent: any }> = ({ footerContent }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="prose mt-10 flex w-full max-w-none flex-col space-y-10 bg-base-200 p-10 shadow-xl lg:flex-row lg:space-x-10 lg:space-y-0">
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
