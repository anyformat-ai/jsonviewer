import { useEffect } from "react";
import { useJsonDoc } from "./useJsonDoc";
import { useJson } from "./useJson";
import { FileHistoryService } from "~/services/fileHistory.client";

export function useFileHistory() {
  const { doc } = useJsonDoc();
  const [json] = useJson();

  useEffect(() => {
    if (!doc || !json) return;

    // Add the current document to history
    const size = doc.type === 'raw' 
      ? FileHistoryService.estimateSize(doc.contents)
      : undefined;

    const preview = doc.type === 'raw' 
      ? FileHistoryService.generatePreview(doc.contents)
      : undefined;

    FileHistoryService.addToHistory({
      id: doc.id,
      title: doc.title,
      type: doc.type === 'url' ? 'url' : 'file',
      size,
      preview,
    });
  }, [doc, json]);

  return {
    addToHistory: FileHistoryService.addToHistory,
    updateLastAccessed: FileHistoryService.updateLastAccessed,
    removeFromHistory: FileHistoryService.removeFromHistory,
    clearHistory: FileHistoryService.clearHistory,
    getHistory: FileHistoryService.getHistory,
  };
}
