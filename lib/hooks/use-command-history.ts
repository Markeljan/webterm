import { useState, useCallback } from "react";

export const useCommandHistory = (initialHistory: string[] = []) => {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [command, setCommand] = useState<string>("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const addToHistory = useCallback((cmd: string) => {
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
  }, []);

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else if (direction === "down" && historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? "" : history[history.length - 1 - newIndex]);
      }
    },
    [history, historyIndex]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    command,
    setCommand,
    addToHistory,
    navigateHistory,
    clearHistory,
  };
};
