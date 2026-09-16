"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { useEffect } from "react";
import { FigureImage } from "@/lib/tiptap/figure-image";
import { ImageUploadButton } from "./ImageUploadButton";
import type { MediaItem } from "@/lib/types";

export function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: "Write your story…",
      }),
      FigureImage,
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "journal-prose min-h-[320px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep the editor in sync if content is replaced from outside (e.g. loading a draft).
  useEffect(() => {
    if (editor && content !== editor.getHTML() && document.activeElement?.closest(".editor-shell") === null) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[380px] rounded-sm border border-line bg-paper-soft p-4 text-sm text-ink-faint">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="editor-shell rounded-sm border border-line bg-paper-soft">
      <Toolbar editor={editor} />
      <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const btn = (active: boolean) =>
    `rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
      active ? "bg-ink text-paper-soft" : "text-ink-soft hover:bg-paper-deep"
    }`;

  function addLink() {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function addVideo() {
    const url = window.prompt("YouTube video URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  function insertImage(media: MediaItem) {
    const caption = window.prompt("Caption (optional)") || "";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "figureImage",
        attrs: { src: media.url, alt: caption, caption },
      })
      .run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2">
      <button type="button" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </button>
      <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </button>
      <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </button>
      <Divider />
      <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </button>
      <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </button>
      <button type="button" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </button>
      <button type="button" className={btn(editor.isActive("link"))} onClick={addLink}>
        Link
      </button>
      <Divider />
      <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </button>
      <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </button>
      <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        &ldquo; Quote
      </button>
      <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {"</>"}
      </button>
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        — Divider
      </button>
      <Divider />
      <ImageUploadButton
        label="🖼 Image"
        className="rounded-sm px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-paper-deep"
        onUploaded={insertImage}
      />
      <button type="button" className={btn(false)} onClick={addVideo}>
        ▶ Video
      </button>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}
