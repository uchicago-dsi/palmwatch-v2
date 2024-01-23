import { getGenericContentConfig } from "./utils";

export default {
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    getGenericContentConfig('column1'),
    getGenericContentConfig('column2'),
    getGenericContentConfig('column3'),
  ]
};
