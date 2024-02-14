import { getGenericContentConfig } from "./utils";

export default {
  name: "country",
  title: "Country",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "Name of the country. This *must* match the name of the country on the page, and it will be used to search for this country's information.",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "externalLink",
      title: "External Link",
      type: "url",
    },
    { 
      ...getGenericContentConfig('content'),
      name: 'content',
      title: 'Additional Content'
    }
  ],
  
};