// --- UI Primitives ---
import { Button } from "~/components/tiptap-ui-primitive/button";
import { Spacer } from "~/components/tiptap-ui-primitive/spacer";
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "~/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "~/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "~/components/tiptap-node/code-block-node/code-block-node.scss";
import "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "~/components/tiptap-node/list-node/list-node.scss";
import "~/components/tiptap-node/image-node/image-node.scss";
import "~/components/tiptap-node/heading-node/heading-node.scss";
import "~/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "~/components/tiptap-ui/heading-dropdown-menu";
// import { ImageUploadButton } from "~/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "~/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "~/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "~/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "~/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "~/components/tiptap-ui/link-popover";
import { MarkButton } from "~/components/tiptap-ui/mark-button";
import { TextAlignButton } from "~/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "~/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "~/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "~/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "~/components/tiptap-icons/link-icon";

// --- Components ---
import { ThemeToggle } from "~/components/editor/theme-toggle";

export const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup> */}

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

export const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);
