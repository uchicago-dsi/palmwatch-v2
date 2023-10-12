export default {
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "disclosures",
      title: "Disclosures",
      type: "array",
      of: [
        {
          name: "disclosure",
          title: "Disclosure",
          type: "object",
          fields: [
            {
              name: "year",
              title: "Year",
              type: "string",
            },
            {
              name: "filename",
              title: "Filename",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "descriptionAttribution",
      title: "Description Attribution",
      type: "text",
    },
    {
      name: "country",
      title: "Country",
      type: "string",
    },
    {
      name: "rspoMemberSince",
      title: "RSPO Member Since",
      type: "string",
    },
    {
      name: "externalLink",
      title: "External Link",
      type: "url",
    },
  ],
};