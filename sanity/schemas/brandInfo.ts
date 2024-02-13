export default {
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "This is an ID used to match the data and must be the same as the navigation / data brand name."
    },
    {
      name: "name",
      title: "Alternate Name (optional)",
      type: "string",
      description: "If the brand is known by a different name, enter it here.",
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
    {
      name: 'content',
      title: 'Additional Content',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          fields: [
            {
              type: 'text',
              name: 'alt',
              title: 'Alternative text',
              description: `Some of your visitors cannot see images, 
                be they blind, color-blind, low-sighted; 
                alternative text is of great help for those 
                people that can rely on it to have a good idea of 
                what\'s on your page.`,
              options: {
                isHighlighted: true
              }
            }
          ]
        }
      ]
    }
  ],
  
};