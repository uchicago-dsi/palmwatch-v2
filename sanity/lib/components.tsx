import { PortableText as OgPortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import type React from "react";
import client from "./client";

export function urlFor(source: string) {
  return imageUrlBuilder(client.client).image(source).url();
}

export const myPortableTextComponents = {
  marks: {
    // @ts-expect-error
    link: ({ value, children }) => {
      const href = value?.href || "";
      const target = value?.blank ? "_blank" : "";
      const referrer = value?.blank ? "noopener noreferrer" : "";
      return (
        <a href={href} rel={referrer} target={target}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: (v: any) => {
      const alt = v?.value?.alt || "";
      const ref = v?.value?.asset?._ref || "";
      if (!ref) {
        return null;
      }
      const src = urlFor(ref);
      const href = v?.value?.link;
      const img = (
        <Image
          alt={alt}
          className="h-auto max-w-full"
          height={800}
          sizes="(max-width: 1200px) 100vw, 1200px"
          src={src}
          width={1200}
        />
      );
      if (href) {
        return (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {img}
          </a>
        );
      }
      return img;
    },
  },
};

export const PortableText: React.FC<{ value: any }> = ({ value }) => {
  // @ts-expect-error
  return <OgPortableText components={myPortableTextComponents} value={value} />;
};
