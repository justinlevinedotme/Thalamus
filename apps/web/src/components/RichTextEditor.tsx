import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { cn } from "../lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: () => void;
  placeholder?: string;
  className?: string;
  textColor?: string;
  singleLine?: boolean;
  autoFocus?: boolean;
};

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  onFocus,
  onEscape,
  onEnter,
  onTab,
  placeholder,
  className,
  textColor,
  singleLine = false,
  autoFocus = false,
}: RichTextEditorProps) {
  // Track if we're currently editing to prevent external value sync
  const isEditingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features we don't need
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        // Keep paragraph and hard break for multi-line
        paragraph: {},
        hardBreak: singleLine ? false : {},
      }),
      Underline,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "nodrag outline-none",
          "[&_p]:m-0", // Remove paragraph margins
          className
        ),
        style: textColor ? `color: ${textColor}` : "",
      },
      handleKeyDown: (view, event) => {
        // Handle Escape key
        if (event.key === "Escape") {
          event.preventDefault();
          onEscape?.();
          return true;
        }
        // Handle Enter key for single-line mode
        if (singleLine && event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onEnter?.();
          return true;
        }
        // Handle Tab key
        if (event.key === "Tab" && !event.shiftKey && onTab) {
          event.preventDefault();
          onTab();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isEditingRef.current = true;
      const html = editor.getHTML();
      // For single-line, strip paragraph tags and just get inner content
      if (singleLine) {
        const content = html.replace(/<\/?p>/g, "");
        onChange(content);
      } else {
        onChange(html);
      }
    },
    onBlur: () => {
      isEditingRef.current = false;
      onBlur?.();
    },
    onFocus: () => {
      isEditingRef.current = true;
      onFocus?.();
    },
    immediatelyRender: false,
  });

  // Update content when value prop changes externally (not during active editing)
  useEffect(() => {
    if (editor && !isEditingRef.current && value !== editor.getHTML()) {
      // Wrap plain text in paragraph tags if needed for consistency
      const content = singleLine ? value : value.startsWith("<") ? value : `<p>${value}</p>`;
      editor.commands.setContent(content);
    }
  }, [editor, value, singleLine]);

  // Auto-focus when requested
  useEffect(() => {
    if (editor && autoFocus) {
      // Small delay to ensure editor is ready
      setTimeout(() => {
        editor.commands.focus("end");
      }, 0);
    }
  }, [editor, autoFocus]);

  // Show placeholder
  const isEmpty = !editor?.getText()?.trim();

  // Track selection state for custom bubble menu
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  // Update selection position
  const updateSelectionPosition = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const hasTextSelection = from !== to;

    setHasSelection(hasTextSelection);

    if (hasTextSelection) {
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Create a rect that spans the selection
      const rect = new DOMRect(
        start.left,
        start.top,
        end.right - start.left,
        end.bottom - start.top
      );
      setSelectionRect(rect);
    } else {
      setSelectionRect(null);
    }
  }, [editor]);

  // Listen to selection changes
  useEffect(() => {
    if (!editor) return;

    editor.on("selectionUpdate", updateSelectionPosition);
    editor.on("blur", () => {
      // Small delay to allow button clicks to register
      setTimeout(() => {
        if (!editor.isFocused) {
          setHasSelection(false);
          setSelectionRect(null);
        }
      }, 150);
    });

    return () => {
      editor.off("selectionUpdate", updateSelectionPosition);
    };
  }, [editor, updateSelectionPosition]);

  if (!editor) {
    return null;
  }

  // Render bubble menu in portal to escape stacking context
  const bubbleMenu =
    hasSelection &&
    selectionRect &&
    createPortal(
      <div
        className="fixed flex gap-0.5 rounded-lg border border-border bg-background p-1 shadow-lg"
        style={{
          left: selectionRect.left + selectionRect.width / 2,
          top: selectionRect.top - 8,
          transform: "translate(-50%, -100%)",
          zIndex: 99999,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition",
            editor.isActive("bold")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Bold"
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition",
            editor.isActive("italic")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Italic"
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded transition",
            editor.isActive("underline")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Underline"
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </div>,
      document.body
    );

  return (
    <div className="relative w-full">
      {bubbleMenu}

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Placeholder */}
      {isEmpty && placeholder && (
        <div
          className="pointer-events-none absolute left-0 top-0 text-muted-foreground"
          style={{ color: textColor ? `${textColor}80` : undefined }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
