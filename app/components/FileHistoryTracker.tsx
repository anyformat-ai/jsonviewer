import { useFileHistory } from "~/hooks/useFileHistory";

export function FileHistoryTracker() {
  // This component just initializes the file history tracking
  // The actual tracking happens in the useFileHistory hook
  useFileHistory();
  
  return null;
}
