import { getGenericContentConfig } from "./utils";

const contactPage = {
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

export default contactPage;
