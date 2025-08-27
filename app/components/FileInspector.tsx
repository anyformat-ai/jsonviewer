import { useState, useEffect } from "react";
import { Link } from "remix";
import { 
  DocumentIcon, 
  TrashIcon, 
  ClockIcon,
  DownloadIcon,
  ExternalLinkIcon,
  CogIcon
} from "@heroicons/react/outline";
import { FileHistoryService, FileHistoryItem } from "~/services/fileHistory.client";
import { Body } from "./Primitives/Body";
import { Title } from "./Primitives/Title";
import { SmallSubtitle } from "./Primitives/SmallSubtitle";

export function FileInspector() {
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHistory(FileHistoryService.getHistory());
    setIsLoaded(true);
  }, []);

  const handleRemoveFile = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    FileHistoryService.removeFromHistory(id);
    setHistory(FileHistoryService.getHistory());
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all file history? This action cannot be undone.")) {
      FileHistoryService.clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isLoaded) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Title className="text-gray-900 font-inter font-semibold">Recent Files</Title>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-inter"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Table */}
      {history.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <SmallSubtitle className="text-gray-500 font-inter">
            No files yet. Your recent files will appear here.
          </SmallSubtitle>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    File name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                    Processed
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/j/${item.id}`}
                        onClick={() => FileHistoryService.updateLastAccessed(item.id)}
                        className="group flex items-center"
                      >
                        <div className="flex-shrink-0 mr-3">
                          {item.type === 'url' ? (
                            <ExternalLinkIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <DocumentIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 font-inter group-hover:text-blue-600 transition-colors truncate">
                            {item.title}
                          </div>
                          {item.preview && (
                            <div className="text-xs text-gray-500 font-mono truncate mt-1" style={{ maxWidth: '200px' }}>
                              {item.preview.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-inter ${
                        item.type === 'url' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'url' ? 'URL' : 'File'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-inter">
                      {item.size ? formatSize(item.size) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-inter">
                      {formatDate(item.lastAccessed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => handleRemoveFile(item.id, e)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from history"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
