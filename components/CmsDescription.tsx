interface CmsDescriptionProps {
  description?: string | React.ReactNode;
  externalLink?: string;
  linkText?: string;
}

export const CmsDescription: React.FC<CmsDescriptionProps> = ({
  description,
  externalLink,
  linkText,
}) => {
  if (!description) {
    return null;
  }

  return (
    <div className="prose my-4 w-full max-w-none bg-base-100 p-4 shadow-xl">
      <p>{description}</p>
      {!!externalLink && (
        <a href={externalLink} rel="noreferrer" target="_blank">
          {linkText ? linkText : "Learn more"}
        </a>
      )}
    </div>
  );
};
