import { useState, useCallback } from "react";

interface HistoryHook {
  history: string[];
  command: string;
  lastCommandIndex: number;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
  setHistory: (value: string) => void;
  clearHistory: () => void;
  setLastCommandIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useHistory = (initialHistory: string[] = []): HistoryHook => {
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [command, setCommand] = useState<string>("");
  const [lastCommandIndex, setLastCommandIndex] = useState<number>(0);

  const addHistory = useCallback((value: string) => {
    setHistory((prevHistory) => [...prevHistory, value]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    command,
    lastCommandIndex,
    setCommand,
    setHistory: addHistory,
    clearHistory,
    setLastCommandIndex,
  };
};
