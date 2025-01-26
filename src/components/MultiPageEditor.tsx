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
  padding: 20px;
  gap: 20px;
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

const LINES_PER_PAGE = 45;

const MultiPageEditor: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([{ id: 1, content: "" }]);
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>(
    {}
  );
  const [activePageId, setActivePageId] = useState(1);

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

  useEffect(() => {
    if (textAreaRefs.current[activePageId]) {
      const textarea = textAreaRefs.current[activePageId];
      textarea?.focus();
      if (textarea) {
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }
    }
  }, [activePageId]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    pageId: number
  ) => {
    const textarea = textAreaRefs.current[pageId];
    if (!textarea) return;

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

  return (
    <EditorContainer>
      {pages.map((page) => (
        <PageContainer key={page.id}>
          <TextArea
            ref={(ref) => (textAreaRefs.current[page.id] = ref)}
            value={page.content}
            onChange={(e) => handleTextChange(page.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, page.id)}
            placeholder={page.id === 1 ? "Start writing here..." : ""}
          />
          <PageNumber>Page {page.id}</PageNumber>
        </PageContainer>
      ))}
    </EditorContainer>
  );
};

export default MultiPageEditor;
