import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface Page {
  id: number;
  content: string;
}

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 0px;
`;

const Toolbar = styled.div`
  width: 210mm;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const ToolButton = styled.button`
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e6e6e6;
  }
`;

const Select = styled.select`
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  outline: none;
`;

const PageContainer = styled.div`
  width: 210mm;
  height: 297mm;
  padding: 10mm;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;

const TextArea = styled.textarea`
  width: calc(100% - 20mm);
  height: calc(100% - 20mm);
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 24px;
  outline: none;
  font-family: Arial, sans-serif;
  overflow: hidden;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 10mm;
  left: 10mm;
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 5mm;
  right: 5mm;
  font-size: 12px;
  color: #666;
  background: white;
  z-index: 1;
`;

const LINES_PER_PAGE = 40;

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

const MultiPageEditor: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([{ id: 1, content: "" }]);
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>(
    {}
  );
  const [activePageId, setActivePageId] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const handleTextChange = (pageId: number, content: string) => {
    const textarea = textAreaRefs.current[pageId];
    if (!textarea) return;

    const updatedPages = [...pages];
    const pageIndex = pages.findIndex((p) => p.id === pageId);

    if (textarea.scrollHeight > textarea.clientHeight) {
      const lines = content.split("\n");
      const currentPageLines = lines.slice(0, LINES_PER_PAGE);
      const nextPageLines = lines.slice(LINES_PER_PAGE);

      updatedPages[pageIndex].content = currentPageLines.join("\n");

      if (pageId === pages.length) {
        const newPageId = pages.length + 1;
        updatedPages.push({
          id: newPageId,
          content: nextPageLines.join("\n"),
        });
        setActivePageId(newPageId);
      } else {
        const nextPageIndex = pageIndex + 1;
        updatedPages[nextPageIndex].content =
          nextPageLines.join("\n") +
          (updatedPages[nextPageIndex].content
            ? "\n" + updatedPages[nextPageIndex].content
            : "");
        setActivePageId(updatedPages[nextPageIndex].id);
      }
    } else {
      updatedPages[pageIndex].content = content;
    }

    setPages(updatedPages);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    pageId: number
  ) => {
    const textarea = textAreaRefs.current[pageId];
    if (!textarea) return;

    // Handle backspace at start of page (except first page)
    if (
      e.key === "Backspace" &&
      textarea.selectionStart === 0 &&
      textarea.selectionEnd === 0 &&
      pageId > 1
    ) {
      e.preventDefault();

      const updatedPages = [...pages];
      const currentPageIndex = pages.findIndex((p) => p.id === pageId);
      const prevPageIndex = currentPageIndex - 1;

      // Move content to previous page
      const prevPageContent = updatedPages[prevPageIndex].content;
      updatedPages[prevPageIndex].content =
        prevPageContent +
        (prevPageContent ? "\n" : "") +
        updatedPages[currentPageIndex].content;

      // Remove current page's content
      updatedPages[currentPageIndex].content = "";

      setPages(updatedPages);
      setActivePageId(pageId - 1);

      // Focus on the end of previous page's content
      setTimeout(() => {
        const prevTextarea = textAreaRefs.current[pageId - 1];
        if (prevTextarea) {
          prevTextarea.focus();
          prevTextarea.setSelectionRange(
            prevPageContent.length,
            prevPageContent.length
          );
        }
      }, 0);

      return;
    }

    // If we're at the last line (content exceeds height)
    if (textarea.scrollHeight > textarea.clientHeight) {
      if (e.key !== "Backspace") {
        e.preventDefault();

        // Create new page if we're on the last page
        if (pageId === pages.length) {
          setPages([...pages, { id: pages.length + 1, content: e.key }]);
          setActivePageId(pages.length + 1);
        } else {
          // Move to next page
          setActivePageId(pageId + 1);
        }
      }
    }

    // Original up/down arrow navigation
    if (
      textarea.selectionStart === textarea.value.length &&
      e.key === "ArrowDown" &&
      pageId < pages.length
    ) {
      setActivePageId(pageId + 1);
    } else if (
      textarea.selectionStart === 0 &&
      e.key === "ArrowUp" &&
      pageId > 1
    ) {
      setActivePageId(pageId - 1);
    }
  };

  const applyStyles = () => {
    const style = {
      fontSize: `${fontSize}px`,
      fontFamily,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderline ? "underline" : "none",
    };

    Object.values(textAreaRefs.current).forEach((textarea) => {
      if (textarea) {
        Object.assign(textarea.style, style);
      }
    });
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    pageId: number
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const textarea = textAreaRefs.current[pageId];
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const currentContent = textarea.value;

    // Calculate available lines in current page
    const currentLines = currentContent.split("\n").length;
    const availableLines = LINES_PER_PAGE - currentLines;

    // Split pasted content into lines
    const pastedLines = pastedText.split("\n");

    // Update pages with pasted content
    const updatedPages = [...pages];
    let currentPageContent = currentContent.slice(0, cursorPosition);
    const remainingContent = currentContent.slice(cursorPosition);
    let currentLineCount = currentPageContent.split("\n").length;
    let currentPageIndex = pages.findIndex((p) => p.id === pageId);

    // Add lines to current page until it's full
    for (let i = 0; i < pastedLines.length; i++) {
      if (currentLineCount < LINES_PER_PAGE) {
        currentPageContent += pastedLines[i] + "\n";
        currentLineCount++;
      } else {
        // Current page is full, create or update next page
        updatedPages[currentPageIndex].content = currentPageContent.trim();

        // If we're on the last page, create a new one
        if (currentPageIndex === updatedPages.length - 1) {
          updatedPages.push({
            id: updatedPages.length + 1,
            content: "",
          });
        }

        // Move to next page
        currentPageIndex++;
        currentPageContent = pastedLines[i] + "\n";
        currentLineCount = 1;
      }
    }

    // Add any remaining content from the original page
    if (remainingContent) {
      currentPageContent += remainingContent;
    }

    // Update the current page
    updatedPages[currentPageIndex].content = currentPageContent.trim();

    // Check for overflow on the final page
    const finalTextarea =
      textAreaRefs.current[updatedPages[currentPageIndex].id];
    if (
      finalTextarea &&
      finalTextarea.scrollHeight > finalTextarea.clientHeight
    ) {
      const lines = currentPageContent.split("\n");
      const currentPageLines = lines.slice(0, LINES_PER_PAGE);
      const overflowLines = lines.slice(LINES_PER_PAGE);

      updatedPages[currentPageIndex].content = currentPageLines.join("\n");

      // Add overflow to new page if needed
      if (overflowLines.length > 0) {
        if (currentPageIndex === updatedPages.length - 1) {
          updatedPages.push({
            id: updatedPages.length + 1,
            content: overflowLines.join("\n"),
          });
        } else {
          const nextPageContent =
            overflowLines.join("\n") +
            "\n" +
            (updatedPages[currentPageIndex + 1]?.content || "");
          updatedPages[currentPageIndex + 1].content = nextPageContent.trim();
        }
      }
    }

    setPages(updatedPages);

    // Focus on the page where the paste ended
    setTimeout(() => {
      const lastPage = textAreaRefs.current[updatedPages[currentPageIndex].id];
      if (lastPage) {
        lastPage.focus();
        lastPage.setSelectionRange(
          currentPageContent.length,
          currentPageContent.length
        );
      }
    }, 0);
  };

  useEffect(() => {
    if (textAreaRefs.current[activePageId]) {
      const textarea = textAreaRefs.current[activePageId];
      textarea?.focus();
      if (textarea) {
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
        applyStyles();
      }
    }
  }, [activePageId, fontSize, fontFamily, isBold, isItalic, isUnderline]);

  return (
    <EditorContainer>
      <Toolbar>
        <Select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </Select>
        <Select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </Select>
        <ToolButton
          className={isBold ? "active" : ""}
          onClick={() => setIsBold(!isBold)}
        >
          B
        </ToolButton>
        <ToolButton
          className={isItalic ? "active" : ""}
          onClick={() => setIsItalic(!isItalic)}
        >
          I
        </ToolButton>
        <ToolButton
          className={isUnderline ? "active" : ""}
          onClick={() => setIsUnderline(!isUnderline)}
        >
          U
        </ToolButton>
      </Toolbar>

      {pages.map((page) => (
        <PageContainer key={page.id}>
          <TextArea
            ref={(ref) => (textAreaRefs.current[page.id] = ref)}
            value={page.content}
            onChange={(e) => handleTextChange(page.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, page.id)}
            onPaste={(e) => handlePaste(e, page.id)}
            placeholder={page.id === 1 ? "Start writing here..." : ""}
          />
          <PageNumber>Page {page.id}</PageNumber>
        </PageContainer>
      ))}
    </EditorContainer>
  );
};

export default MultiPageEditor;
