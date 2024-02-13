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
  if (!description) return null;

  return (
    <div className="prose bg-neutral-50 p-4 my-4 w-full shadow-xl max-w-none">
      <p>{description}</p>
      {!!externalLink && (
        <a href={externalLink} target="_blank" rel="noreferrer">
          {linkText ? linkText : "Learn more"}
        </a>
      )}
    </div>
  );
};
