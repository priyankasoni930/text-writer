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
    // Reduce page height to account for top/bottom margins and spacing around breaker
    const pageHeight = 787; // Reduced from 827 to account for additional padding
    const neededPages = Math.ceil(editorHeight / pageHeight);

    for (let i = 0; i < neededPages; i++) {
      const page = document.createElement("div");
      page.classList.add("page");
      pagesRef.current.appendChild(page);
      if (i < neededPages - 1) {
        const breaker = document.createElement("div");
        breaker.classList.add("breaker");
        pagesRef.current.appendChild(breaker);
      }
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
            margin: 10px auto;
            background: transparent;
          }
          .toolbar {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: flex;
            gap: 10px;
            z-index: 3;
            margin-bottom: 20px;
          }
          .breaker {
            position: relative;
            height: 1px;
            background-color: #ddd;
            width: 100%;
            padding-top:  1px;
            padding-bottom: 1px;
            pointer-events: none;
          }
          #pages {
            position: absolute;
            top: 2px;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 0;
            pointer-events: none;
          }
          .page {
            position: relative;
            width: 100%;
            height: 787px; /* Reduced to account for padding */
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 0;
            padding: 20px 0; /* Added padding top and bottom */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            box-sizing: border-box;
          }
          #editor {
            position: relative;
            z-index: 1;
            min-height: 787px; /* Match page height */
            padding: 60px 60px; /* Increased top/bottom padding */
            background: transparent;
            box-sizing: border-box;
          }
          #editor:focus-visible {
            outline: none;
          }
          #editor p {
            position: relative;
            background-color: transparent;
            margin: 0;
            padding: 8px 0; /* Increased padding for paragraphs */
            line-height: 1.6; /* Increased line height */
            z-index: 1;
            max-width: 100%;
            overflow-wrap: break-word;
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
            .breaker {
              page-break-after: always;
              border: none;
              background: none;
              height: 0;
              margin: 0;
            }
            .page {
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 20px 0; /* Maintain padding in print */
            }
            #editor {
              padding: 60px 60px; /* Maintain padding in print */
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
