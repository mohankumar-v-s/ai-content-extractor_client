import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink, Calendar, X, Eye, Dot } from 'lucide-react';
import type { ExtractedContent } from '@/lib/gemini';
import { cn, formatDate, getRelativeTime, truncateText } from '@/lib/utils';

interface ContentTableProps {
  data: ExtractedContent[];
}

type SortField = 'title' | 'timestamp' | 'status';
type SortDirection = 'asc' | 'desc';

export function ContentTable({ data }: ContentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItem, setSelectedItem] = useState<ExtractedContent | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort the data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const openDetails = (item: ExtractedContent) => {
    setSelectedItem(item);
  };

  const closeDetails = () => {
    setSelectedItem(null);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No content extracted yet</p>
          <p className="text-sm">Start by entering a URL above to extract content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 bg-white rounded-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground py-2">
        Showing {filteredAndSortedData.length} of {data.length} results
      </div>

      {/* Table */}
      <div className="">
        <div className="overflow-x-auto rounded bg-white">
          <table className="w-full rounded overflow-hidden">
            <thead className="bg-muted/50 overflow-hidden rounded">
              <tr className='overflow-hidden rounded bg-gray-200'>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Title
                    {getSortIcon('title')}
                  </button>
                </th>
                <th className="text-left p-4 font-medium">Summary</th>
                <th className="text-left p-4 font-medium">Key Points</th>
                <th className="text-left p-4 font-medium">URL</th>
                <th className="text-left p-4 font-medium">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Action
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndSortedData.map((item, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors even:bg-gray-100">
                  <td className="p-4">
                    <div className="font-medium">{truncateText(item.title, 50)}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {truncateText(item.summary, 70)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {item.keyPoints.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {item.keyPoints.slice(0, 3).map((point, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              {truncateText(point, 40)}
                            </li>
                          ))}
                          {item.keyPoints.length > 3 && (
                            <li className="text-muted-foreground text-xs">
                              +{item.keyPoints.length - 3} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">No key points</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {truncateText(item.url, 25)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-4 w-32">
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          item.status === 'success'
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}
                      >
                        {item.status}
                      </span>

                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getRelativeTime(new Date(item.timestamp))}
                    </div>
                    <button
                      onClick={() => openDetails(item)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No results match your search criteria</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Content Details</h2>
                <button
                  onClick={closeDetails}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{selectedItem.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(new Date(selectedItem.timestamp))}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        selectedItem.status === 'success'
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">URL</h4>
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:underline break-all"
                >
                  {selectedItem.url}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Summary</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedItem.summary}
                </p>
              </div>

              {/* Key Points */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Points</h4>
                {selectedItem.keyPoints.length > 0 ? (
                  <ul className="space-y-2 list-disc">
                    {selectedItem.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-muted-foreground flex items-start gap-3">
                        <Dot />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No key points available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 