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

export const umlInfoQuery = groq`
*[_type == "mill" && name == $uml][0] {
  _id,
  name,
  description,
  externalLink,
  content[] {
    ...,
    _type,
  }
}
`;

export const aboutPageQuery = groq`
*[_type == "about"][0] {
  _id,
  title,
  content[] {
    ...,
    _type,
  },
  faq[] {
    ...,
    _type,
  }
}
`;

export const contactPageQuery = groq`
*[_type == "contact"][0] {
  _id,
  title,
  content[] {
    ...,
    _type,
  }
}
`;

export const footerInfoQuery = groq`
*[_type == "footer"][0] {
  _id,
  title,
  column1[] {
    ...,
    _type,
  },
  column2[] {
    ...,
    _type,
  },
  column3[] {
    ...,
    _type,
  }
}
`;