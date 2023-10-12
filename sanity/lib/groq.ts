import { groq } from "next-sanity";

export const brandInfoQuery = groq`
*[_type == "brandinfo" && name == $name][0] {
  _id,
  name,
  logo {
    ...,
    "blurDataURL":asset->metadata.lqip,
    "ImageColor": asset->metadata.palette.dominant.background,
  },
  description,
  website,
  socialMedia[]-> {
    _id,
    name,
    url,
  },
  contact {
    email,
    phone,
    address,
  },
}
`;