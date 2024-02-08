import imageUrlBuilder from '@sanity/image-url'
import { PortableText as OgPortableText } from "@portabletext/react";
import client from './client';

function urlFor(source: string) {
  return imageUrlBuilder(client.client).image(source).url()
}

export const myPortableTextComponents = {
  types: {
    image: (v: any) =>  {
      const alt = v?.value?.alt || '';
      const src = urlFor(v?.value?.asset?._ref || '');
      const href = v?.value?.link
      const img = <img src={urlFor(v?.value?.asset?._ref || '')}  alt={v?.value?.alt || ''} />
      if (href) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        )
      } else {
        return img
      }
  }
  }
}

export const PortableText: React.FC<{value: any}> = ({value}) => {
  return <OgPortableText value={value} components={myPortableTextComponents}/>
}