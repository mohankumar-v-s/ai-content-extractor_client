export interface ExtractedContent {
  title: string;
  summary: string;
  keyPoints: string[];
  url: string;
  timestamp: Date;
  status: 'success' | 'error';
  error?: string;
} 