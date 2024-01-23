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
      name: "content",
      title: "Main Content",
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
            {
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
            },
          ],
        },
      ],
    },
  ],
};
