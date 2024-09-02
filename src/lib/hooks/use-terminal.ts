import { BANNER, commands, isValidCommand } from "@/lib/commands";
import { useCallback, useState } from "react";

export type HistoryItem = {
  type: "command" | "output";
  value: string;
};

export const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([{ type: "output", value: BANNER }]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => [...prev, item]);
    if (item.type === "command" && item.value.trim() !== "") {
      setCommandHistory((prev) => [...prev, item.value]);
    }
    setHistoryIndex(-1);
  }, []);

  const clearOutput = useCallback(() => {
    setHistory([]);
  }, []);

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (direction === "up" && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (direction === "down" && historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]);
      }
    },
    [commandHistory, historyIndex]
  );

  const executeCommand = useCallback(
    async (cmd: string) => {
      const trimmedCmd = cmd.trim();
      if (trimmedCmd === "") {
        addToHistory({ type: "command", value: "" });
      } else {
        addToHistory({ type: "command", value: trimmedCmd });
        const args = trimmedCmd.split(" ");
        const commandName = args[0].toLowerCase();

        if (commandName === "clear") {
          clearOutput();
        } else if (isValidCommand(commandName)) {
          const result = await commands[commandName](args.slice(1));
          addToHistory({ type: "output", value: result });
        } else {
          addToHistory({ type: "output", value: `command not found: ${commandName}` });
        }
      }
      setCommand("");
    },
    [addToHistory, clearOutput]
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(event.target.value);
  }, []);

  const handleTabCompletion = useCallback(() => {
    const availableCommands = Object.keys(commands).filter((entry) => entry.startsWith(command));

    if (availableCommands.length === 1) {
      setCommand(availableCommands[0]);
    }
  }, [command]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        navigateHistory(event.key === "ArrowUp" ? "up" : "down");
      } else if (event.key === "Tab") {
        event.preventDefault();
        handleTabCompletion();
      } else if (event.key === "Enter") {
        executeCommand(command);
      }
    },
    [command, executeCommand, navigateHistory, handleTabCompletion]
  );

  return {
    history,
    command,
    setCommand,
    handleChange,
    handleKeyDown,
    executeCommand,
    clearOutput,
  };
};
