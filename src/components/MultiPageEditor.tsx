import React, { useEffect, useRef, useState } from "react";

const MultiPageEditor = () => {
  const editorRef = useRef(null);
  const pagesRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  const adjustNumberOfPages = () => {
    if (!editorRef.current || !pagesRef.current) return;

    while (pagesRef.current.firstChild) {
      pagesRef.current.removeChild(pagesRef.current.firstChild);
    }

    const editorHeight = editorRef.current.clientHeight;
    // Increased from 547 to 847 to match the new page height
    const neededPages = Math.ceil(editorHeight / 847);

    for (let i = 0; i < neededPages; i++) {
      const page = document.createElement("div");
      page.classList.add("page");
      pagesRef.current.appendChild(page);
      const breaker = document.createElement("div");
      breaker.classList.add("breaker");
      pagesRef.current.appendChild(breaker);
    }

    setPageCount(neededPages);
  };

  const handleSave = () => {
    if (!editorRef.current) return;
    localStorage.setItem("document-content", editorRef.current.innerHTML);
    alert("Document saved!");
  };

  const handleLoad = () => {
    if (!editorRef.current) return;
    const content = localStorage.getItem("document-content");
    if (content) {
      editorRef.current.innerHTML = content;
      setTimeout(adjustNumberOfPages, 0);
    } else {
      alert("No saved document found!");
    }
  };

  const handleClear = () => {
    if (!editorRef.current) return;
    if (confirm("Are you sure you want to clear the document?")) {
      editorRef.current.innerHTML = "<p>Start typing here...</p>";
      setTimeout(adjustNumberOfPages, 0);
    }
  };

  const handleEditorFocus = () => {
    if (editorRef.current?.textContent === "Start typing here...") {
      editorRef.current.innerHTML = "<p></p>";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertParagraph", false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const lines = text.split(/\r?\n/);
    const fragment = document.createDocumentFragment();

    lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line || " ";
      fragment.appendChild(p);
    });

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(fragment);

    const newRange = document.createRange();
    newRange.selectNodeContents(editorRef.current);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setTimeout(adjustNumberOfPages, 0);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "<p>Start typing here...</p>";
    }

    const observer = new MutationObserver(() => {
      setTimeout(adjustNumberOfPages, 0);
    });

    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    const handleResize = () => {
      setTimeout(adjustNumberOfPages, 0);
    };

    window.addEventListener("resize", handleResize);
    adjustNumberOfPages();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .container {
            position: relative;
            max-width: 800px;
            border: 1px solid #ddd;
            margin: 10px auto;
            padding: 10px;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .toolbar {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 10px;
            z-index: 3;
          }
          .breaker {
            position: relative;
            left: 0;
            right: 0;
            height: 10px;
            background-color: #ddd;
            width: calc(100% + 20px);
            z-index: 2;
            float: left;
            clear: both;
            margin: 20px -10px;
          }
          #pages::before {
            content: " ";
            position: absolute;
            top: -11px;
            left: -1px;
            right: 0;
            font-size: 12px;
            color: white;
            width: 822px;
            background-color: white;
            display: block;
            height: 10px;
          }
          .page {
            position: relative;
            float: left;
            clear: both;
            margin-top: 800px;  /* Increased from 500px to 800px */
          }
          #editor {
            position: relative;
            z-index: 1;
            min-height: 800px;  /* Increased from 500px to 800px */
          }
          #editor:focus-visible {
            outline: none;
          }
          #editor p {
            position: relative;
            background-color: white;
            margin: 0;
            padding: 10px 0;
          }
          .page-counter {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .toolbar button {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
          }
          .toolbar button:hover {
            background: #f5f5f5;
            border-color: #ccc;
          }
          @media print {
            body {
              background: none;
            }
            .toolbar, .page-counter {
              display: none;
            }
          }
        `}
      </style>

      <div className="container">
        <div id="pages" ref={pagesRef}></div>
        <div
          id="editor"
          ref={editorRef}
          contentEditable
          onFocus={handleEditorFocus}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <div className="page-counter">
          Page: <span>{pageCount}</span>
        </div>
      </div>
    </>
  );
};

export default MultiPageEditor;
