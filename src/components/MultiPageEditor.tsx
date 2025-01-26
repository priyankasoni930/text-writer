import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MultiPageEditor = () => {
  const [pages, setPages] = useState([""]);
  const [currentPage, setCurrentPage] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Clear localStorage on component mount
  useEffect(() => {
    localStorage.removeItem('editorPages');
    setPages([""]);
    setCurrentPage(0);
  }, []);

  const saveContent = () => {
    setSaving(true);
    localStorage.setItem('editorPages', JSON.stringify(pages));
    setTimeout(() => setSaving(false), 1000);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      saveContent();
    }, 1000);

    return () => clearTimeout(debounce);
  }, [pages]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const updatedPages = [...pages];
    updatedPages[currentPage] = newText;
    setPages(updatedPages);

    if (textareaRef.current && 
        textareaRef.current.scrollHeight > textareaRef.current.clientHeight && 
        newText.length > 0) {
      updatedPages.push("");
      setPages(updatedPages);
      setCurrentPage(updatedPages.length - 1);
    }
  };

  const changePage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTotalWordCount = () => {
    return pages.reduce((total, page) => total + getWordCount(page), 0);
  };

  const handleDownload = () => {
    const content = pages.join('\n\n--- Page Break ---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document downloaded",
      description: "Your document has been downloaded successfully",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {pages.map((_, index) => (
            <Button 
              key={index} 
              variant={currentPage === index ? "default" : "outline"} 
              className="min-w-[80px] transition-all duration-200 ease-in-out"
              onClick={() => changePage(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="h-9 w-9"
          >
            <Download className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getTotalWordCount()} words
          </span>
          <motion.div
            animate={saving ? { opacity: 1 } : { opacity: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Save className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Textarea
                ref={textareaRef}
                value={pages[currentPage]}
                onChange={handleTextChange}
                className="w-full min-h-[500px] resize-none border-none focus:ring-0 bg-transparent text-lg leading-relaxed"
                placeholder="Start writing your thoughts..."
                style={{ 
                  caretColor: 'currentColor',
                }}
              />
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <span>Page {currentPage + 1} of {pages.length}</span>
                <span>{getWordCount(pages[currentPage])} words on this page</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiPageEditor;