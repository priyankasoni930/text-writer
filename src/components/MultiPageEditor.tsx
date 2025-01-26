import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MultiPageEditor = () => {
  const [pages, setPages] = useState([""]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const textAreaRefs = useRef([]);

  const handleTextChange = (e, pageIndex) => {
    const newText = e.target.value;
    const updatedPages = [...pages];
    const textarea = textAreaRefs.current[pageIndex];

    if (textarea) {
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight);
      const maxLines = Math.floor(textarea.clientHeight / lineHeight);
      const currentLines = newText.split('\n').length;

      if (currentLines > maxLines) {
        // Create a new page and move excess text to it
        const currentPageText = newText.split('\n').slice(0, maxLines).join('\n');
        const remainingText = newText.split('\n').slice(maxLines).join('\n');
        
        updatedPages[pageIndex] = currentPageText;
        updatedPages.push(remainingText);
        
        setPages(updatedPages);
        setCurrentPage(updatedPages.length - 1);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        return;
      }

      updatedPages[pageIndex] = newText;
      setPages(updatedPages);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {showAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Page is full. Continuing on the next page.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {pages.map((pageContent, index) => (
          <Card 
            key={index} 
            className={`
              ${currentPage === index ? 'border-primary' : 'border-gray-200'}
              ${currentPage !== index ? 'opacity-100' : ''}
            `}
          >
            <CardContent className="p-4">
              <Textarea
                ref={(el) => {
                  textAreaRefs.current[index] = el;
                }}
                value={pageContent}
                onChange={(e) => handleTextChange(e, index)}
                className="w-full h-[calc(24rem-2rem)] resize-none overflow-hidden border-gray-200 focus-visible:ring-1"
                placeholder={`Page ${index + 1} content...`}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MultiPageEditor;
