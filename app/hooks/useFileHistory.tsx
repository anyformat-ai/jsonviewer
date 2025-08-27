import { useEffect } from "react";
import { useJsonDoc } from "./useJsonDoc";
import { useJson } from "./useJson";
import { FileHistoryService } from "~/services/fileHistory.client";

export function useFileHistory() {
  const { doc } = useJsonDoc();
  const [json] = useJson();

  useEffect(() => {
    if (!doc || !json) return;

    try {
      // Add the current document to history
      const size = doc.type === 'raw' 
        ? FileHistoryService.estimateSize(doc.contents)
        : undefined;

      const preview = doc.type === 'raw' 
        ? FileHistoryService.generatePreview(doc.contents)
        : undefined;

      // Skip adding to history if the content is too large
      if (size && size > 100 * 1024 * 1024) { // 100MB limit for history - being generous with RAM
        console.warn('Document too large for file history:', size);
        return;
      }

      FileHistoryService.addToHistory({
        id: doc.id,
        title: doc.title,
        type: doc.type === 'url' ? 'url' : 'file',
        size,
        preview,
      });
    } catch (error) {
      console.error('Failed to add document to history:', error);
    }
  }, [doc, json]);

  return {
    addToHistory: FileHistoryService.addToHistory,
    updateLastAccessed: FileHistoryService.updateLastAccessed,
    removeFromHistory: FileHistoryService.removeFromHistory,
    clearHistory: FileHistoryService.clearHistory,
    getHistory: FileHistoryService.getHistory,
  };
}
