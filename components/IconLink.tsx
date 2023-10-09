import Link from "next/link";

export const IconLink: React.FC<{label: string, href:string}> = ({href, label}) => {
  return (
    <Link href={href} aria-label={`Link to ${label}`}>
      <svg
        width="20px"
        height="20px"
        version="1.1"
        viewBox="10 10 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="inline ml-2 fill-info"
      >
        <path d="m84.328 9.7188h-68.652c-3.2812 0-5.957 2.6758-5.957 5.957v68.652c0 3.2812 2.6758 5.957 5.957 5.957h68.652c3.2812 0 5.957-2.6758 5.957-5.957v-68.652c-0.003906-3.2852-2.6758-5.957-5.957-5.957zm-39.699 19.168h26.484v26.484l-11.172-11.172-26.914 26.914-4.1406-4.1406 26.914-26.914z" />
      </svg>
    </Link>
  );
};
