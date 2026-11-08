import {
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  MDXEditor,
  convertSelectionToNode$,
  currentBlockType$,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  useCellValue,
  usePublisher,
} from "@mdxeditor/editor";
import { $createHeadingNode } from "@lexical/rich-text";
import "@mdxeditor/editor/style.css";
import { useComputedColorScheme } from "@mantine/core";

type HeadingLevel = "h1" | "h2" | "h3";

function HeadingButton({ level }: { level: HeadingLevel }) {
  const convertSelectionToNode = usePublisher(convertSelectionToNode$);
  const currentBlockType = useCellValue(currentBlockType$);
  const active = currentBlockType === level;

  return (
    <button
      type="button"
      title={`Heading ${level.slice(1)}`}
      aria-label={`Heading ${level.slice(1)}`}
      onClick={() => convertSelectionToNode(() => $createHeadingNode(level))}
      style={{
        minWidth: 26,
        height: 24,
        padding: "0 4px",
        fontSize: 12,
        fontWeight: 700,
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        color: "inherit",
        background: active ? "var(--mantine-color-default-hover)" : "transparent",
      }}
    >
      {level.toUpperCase()}
    </button>
  );
}

export function MarkdownEditor({
  value,
  onChange,
  minHeight = 320,
  toolbar = true,
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  toolbar?: boolean;
}) {
  const colorScheme = useComputedColorScheme("light");

  return (
    <div
      className={colorScheme === "dark" ? "dark-theme" : undefined}
      style={{ minHeight }}
    >
      <MDXEditor
        markdown={value}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          ...(toolbar
            ? [
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <HeadingButton level="h1" />
                      <HeadingButton level="h2" />
                      <HeadingButton level="h3" />
                      <BoldItalicUnderlineToggles />
                      <ListsToggle />
                      <CreateLink />
                    </>
                  ),
                }),
              ]
            : []),
        ]}
      />
    </div>
  );
}
