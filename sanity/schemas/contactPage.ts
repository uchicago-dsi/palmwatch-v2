import { getGenericContentConfig } from "./utils";

export default {
  name: "contact",
  title: "Contact",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    getGenericContentConfig("content"),
  ],
};
