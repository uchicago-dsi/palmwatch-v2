import imageUrlBuilder from '@sanity/image-url'
import { PortableText as OgPortableText } from "@portabletext/react";
import client from './client';

function urlFor(source: string) {
  return imageUrlBuilder(client.client).image(source).url()
}

export const myPortableTextComponents = {
  types: {
    image: (v: any) =>  {
      return <img src={urlFor(v?.value?.asset?._ref || '')}  alt={v?.value?.alt || ''} />
  }
  }
}

export const PortableText: React.FC<{value: any}> = ({value}) => {
  return <OgPortableText value={value} components={myPortableTextComponents}/>
}