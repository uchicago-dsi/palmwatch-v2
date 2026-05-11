import imageUrlBuilder from "@sanity/image-url";
import { PortableText as OgPortableText } from "@portabletext/react";
import Image from "next/image";
import React from "react";
import client from "./client";

export function urlFor(source: string) {
  return imageUrlBuilder(client.client).image(source).url()
}

export const myPortableTextComponents = {
  marks: {
    // @ts-ignore
    link: ({ value, children }) => {
      const href = value?.href || "";
      const target = value?.blank ? "_blank" : "";
      const referrer = value?.blank ? "noopener noreferrer" : "";
      return (
        <a href={href} target={target} rel={referrer}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: (v: any) => {
      const alt = v?.value?.alt || "";
      const ref = v?.value?.asset?._ref || "";
      if (!ref) return null;
      const src = urlFor(ref);
      const href = v?.value?.link;
      const img = (
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="max-w-full h-auto"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      );
      if (href) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        );
      } else {
        return img;
      }
    },
  },
};

export const PortableText: React.FC<{value: any}> = ({value}) => {
  // @ts-ignore
  return <OgPortableText value={value} components={myPortableTextComponents}/>
}