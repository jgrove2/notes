"use client";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node ---
// import { ImageUploadNode } from "~/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "~/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "~/components/tiptap-node/code-block-node/code-block-node.scss";
import "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "~/components/tiptap-node/list-node/list-node.scss";
import "~/components/tiptap-node/image-node/image-node.scss";
import "~/components/tiptap-node/heading-node/heading-node.scss";
import "~/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { ImageUploadNode } from "~/components/tiptap-node/image-upload-node";
export const Extensions = [
  StarterKit.configure({
    horizontalRule: false,
    link: {
      openOnClick: false,
      enableClickSelection: true,
    },
  }),
  HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Typography,
  Superscript,
  Subscript,
  Selection,
];
