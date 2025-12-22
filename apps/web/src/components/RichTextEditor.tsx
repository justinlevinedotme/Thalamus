import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
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
      onBlur?.();
    },
    onFocus: () => {
      onFocus?.();
    },
    immediatelyRender: false,
  });

  // Update content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Wrap plain text in paragraph tags if needed for consistency
      const content = singleLine ? value : (value.startsWith("<") ? value : `<p>${value}</p>`);
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

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Floating toolbar */}
      <BubbleMenu
        editor={editor}
        options={{
          placement: "top",
          offset: 8,
        }}
      >
        <div
          className="flex gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
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
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:bg-slate-100"
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
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:bg-slate-100"
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
                ? "bg-slate-200 text-slate-900"
                : "text-slate-600 hover:bg-slate-100"
            )}
            aria-label="Underline"
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
        </div>
      </BubbleMenu>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Placeholder */}
      {isEmpty && placeholder && (
        <div
          className="pointer-events-none absolute left-0 top-0 text-slate-400"
          style={{ color: textColor ? `${textColor}80` : undefined }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
