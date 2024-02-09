import { getGenericContentConfig } from "./utils";

export default {
  name: "about",
  title: "About",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      ...getGenericContentConfig("content"),
      title: "Main Content",
    },
    {
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        {
          name: "faq question",
          title: "FAQ Question",
          type: "object",
          fields: [
            {
              name: "heading",
              title: "Heading (Question)",
              type: "string",
            },
            getGenericContentConfig("body"),
          ]
        },
      ],
    },
  ],
};
