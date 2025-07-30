

import React, { useState } from 'react';
import { UrlInput } from '@/components/UrlInput';
import { ContentTable } from '@/components/ContentTable';
import type { ExtractedContent } from '@/lib/gemini';
import { Search } from 'lucide-react';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract content');
      }

      const result: ExtractedContent = await response.json();
      setExtractedData(prev => [result, ...prev]);
    } catch (error) {
      console.error('Error extracting content:', error);
      // Add error entry to the table
      const errorEntry: ExtractedContent = {
        title: 'Error',
        summary: error instanceof Error ? error.message : 'Unknown error occurred',
        keyPoints: [],
        url,
        timestamp: new Date(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setExtractedData(prev => [errorEntry, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("aicontent");
    setExtractedData(stored ? JSON.parse(stored) : []);
  }, []);



  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {/* <div>
        <button onClick={() => {
          localStorage.setItem("aicontent", JSON.stringify(extractedData))
        }}>Click Me</button>
      </div> */}
      <header className="bg-gradient-to-b from-blue-50 to-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-2 py-4 max-w-screen-lg">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2563EB] rounded-xl shadow-md">
                <Search className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI URL Extractor</h1>
                <p className="text-base text-muted-foreground mt-1">
                  Extract and summarize content from any public URL using AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-8 max-w-screen-xl w-full">
        <div className="space-y-10">
          {/* URL Input Section */}
          <section className="space-y-6 bg-white border-[#F3F4F6] border py-4 rounded-xl max-w-2xl mx-auto px-4">
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Extract Content</h2>
            </div>
            <UrlInput onExtract={handleExtract} isLoading={isLoading} />
          </section>

          {/* Results Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h3 className="text-xl font-semibold">Extracted Content</h3>
              {extractedData.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {extractedData.filter(item => item.status === 'success').length} successful,{' '}
                  {extractedData.filter(item => item.status === 'error').length} failed
                </div>
              )}
            </div>
            <ContentTable data={extractedData} />
          </section>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="border-t border-gray-200 bg-white mt-16 sticky bottom-0 z-20 shadow-inner">
        <div className="container mx-auto px-4 py-6 max-w-screen-lg">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js, Tailwind CSS, and Gemini AI</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
} 