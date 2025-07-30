'use client';

import { useState } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  onExtract: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function UrlInput({ onExtract, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      await onExtract(url.trim());
      setUrl('');
    } catch (error) {
      setError('Failed to extract content. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl flex flex-col gap-2">
        <div className='flex gap-2'>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any public URL to extract and summarize its content using AI"
              className={cn(
                "block w-full pl-12 pr-16 py-4 border rounded-xl text-base",
                "bg-background border-gray-200 focus-visible:outline-none",
                "placeholder:text-muted-foreground",
                error && "border-destructive focus:ring-destructive"
              )}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={cn(
              "px-6 flex items-center",
              "bg-[#2563EB] text-white hover:bg-[#2563EB]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "rounded-xl transition-colors text-base font-semibold"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-base text-destructive font-medium text-center">{error}</p>
        )}
      </form>
      <div className="mt-4 text-left">
        <p className="text-sm text-muted-foreground">
          Try URLs like: <span className='text-blue-500'>https://example.com, https://news.ycombinator.com, https://github.com</span>
        </p>
      </div>
    </div>
  );
} 