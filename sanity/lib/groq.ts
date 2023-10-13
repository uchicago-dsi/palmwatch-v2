import { groq } from "next-sanity";

export const brandInfoQuery = groq`
*[_type == "brand" && name == $name][0] {
  _id,
  name,
  description,
  descriptionAttribution,
  country,
  rspoMemberSince,
  externalLink,
  disclosures[] {
    year,
    filename
  },
  content[] {
    ...,
    _type,
  }
}
`;