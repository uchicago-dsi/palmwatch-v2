import { getGenericContentConfig } from "./utils";

export default {
  name: "landingPage",
  title: "Landing Page Content",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "page",
      title: "Page Path",
      type: "string",
      description: "This is used to match the content here to the page. Eg. palmwatch.idi.net/brands should be 'brands' (no quotes)."
    },
    {
      ...getGenericContentConfig("content"),
      title: "Intro Content",
    },
    {
      ...getGenericContentConfig("dislclaimer"),
      title: "Disclaimer / Bottom Content",
    }
  ]
};
