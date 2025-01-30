import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Pagination } from "tiptap-pagination-breaks";
import React from "react";

const MultiPageEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Pagination.configure({
        pageHeight: 800,
        pageWidth: 595,
        pageMargin: 40,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
      handleKeyDown: (view: any, event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          editor?.commands.enter();
          return true;
        }
      },
    },
  });

  const handleSave = () => {
    if (editor) {
      localStorage.setItem("document-content", editor.getHTML());
      alert("Document saved!");
    }
  };

  const handleLoad = () => {
    const content = localStorage.getItem("document-content");
    if (content && editor) {
      editor.commands.setContent(content);
    } else {
      alert("No saved document found!");
    }
  };

  const handleClear = () => {
    if (editor && confirm("Are you sure you want to clear the document?")) {
      editor.commands.setContent("");
    }
  };

  return (
    <>
      <style>
        {`
          .editor-container {
            max-width: 210mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }

          .toolbar {
            padding: 10px;
            background: white;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 10px;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .toolbar button {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }

          .toolbar button:hover {
            background: #f5f5f5;
            border-color: #ccc;
          }

          .editor-content {
            padding: 20px;
            min-height: 297mm;
          }

          .ProseMirror {
            min-height: 297mm;
            outline: none;
          }

          .page-break {
            height: 20px;
            margin: 20px -20px;
            border-top: 2px dashed #ccc;
            border-bottom: 2px dashed #ccc;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .page-break::after {
            content: "Page Break";
            background: white;
            padding: 4px 12px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
          }

          p {
            margin: 0;
            padding: 8px 0;
          }
        `}
      </style>

      <div className="editor-container">
        <div className="toolbar">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleLoad}>Load</button>
          <button onClick={handleClear}>Clear</button>
        </div>
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default MultiPageEditor;
