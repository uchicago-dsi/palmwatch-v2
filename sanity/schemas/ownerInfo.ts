import { getGenericContentConfig } from "./utils";

export default {
  name: "supplier",
  title: "Mill Owners",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
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
      title: 'Additional Content',
    }
  ],
  
};