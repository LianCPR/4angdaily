import { Node, mergeAttributes } from "@tiptap/core";

export interface FigureImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (options: {
        src: string;
        alt?: string;
        caption?: string;
      }) => ReturnType;
    };
  }
}

/** Renders as <figure><img/><figcaption>…</figcaption></figure> — an editorial
 * image block with an optional caption, matching the public article typography. */
export const FigureImage = Node.create<FigureImageOptions>({
  name: "figureImage",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-type='figure-image']",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const img = el.querySelector("img");
          const figcaption = el.querySelector("figcaption");
          return {
            src: img?.getAttribute("src") || null,
            alt: img?.getAttribute("alt") || "",
            caption: figcaption?.textContent || "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, caption } = node.attrs;
    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "figure-image",
      }),
      ["img", { src, alt }],
      ...(caption ? [["figcaption", {}, caption] as any] : []),
    ];
  },

  addCommands() {
    return {
      setFigureImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
