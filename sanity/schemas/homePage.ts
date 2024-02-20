import { getGenericContentConfig } from "./utils";

export default {
  name: "home",
  title: "Home",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
    },
    {
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "string",
    },
    {
      ...getGenericContentConfig("content"),
      name: "introContent",
      title: "Intro Content",
    },
    {
    // list of fields with image and title and body text
      name: "useCases",
      title: "Use Cases",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              ...getGenericContentConfig("content"),
              name: "body",
              title: "Body",
            },
            {
              name: "image",
              title: "Image",
              type: "image",
            },
          ],
        },
      ],
    },
    {
      ...getGenericContentConfig("content"),
      name: "mapDescription",
      title: "Map Description"
    },
  ],
};
