const contentSchema = {
  name: "body",
  title: "Body (Answer)",
  type: "array",
  of: [
    {
      type: "block",
    },
    {
      type: "image",
      fields: [
        {
          type: "text",
          name: "alt",
          title: "Alternative text",
          description: `Some of your visitors cannot see images, 
            be they blind, color-blind, low-sighted; 
            alternative text is of great help for those 
            people that can rely on it to have a good idea of 
            what\'s on your page.`,
          options: {
            isHighlighted: true,
          },
        },
      ],
    },
  ],
}

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
      ...contentSchema,
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
              ...contentSchema,
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
      ...contentSchema,
      name: "mapDescription",
      title: "Map Description"
    },
  ],
};
