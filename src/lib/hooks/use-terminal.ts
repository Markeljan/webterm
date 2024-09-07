import { useCallback, useState } from "react";
import { useAccount, useConnect } from "wagmi";

import { BANNER, commands, isValidCommand } from "@/lib/commands";
import { fhenix } from "@/lib/config-web3";

export type HistoryItem = {
  type: "command" | "output";
  value: string;
};

export const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([{ type: "output", value: BANNER }]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();

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
        const [commandName, ...args] = trimmedCmd.split(" ");
        if (commandName === "clear") {
          clearOutput();
        } else if (isValidCommand(commandName)) {
          if (commandName === "connect") {
            if (!isConnected) {
              connect({ connector: connectors[0], chainId: fhenix.id });
              addToHistory({ type: "output", value: "Connecting..." });
            } else {
              addToHistory({ type: "output", value: "Already connected." });
            }
          } else {
            const result = await commands[commandName](args);
            addToHistory({ type: "output", value: result });
          }
        } else {
          addToHistory({ type: "output", value: `command not found: ${commandName}` });
        }
      }
      setCommand("");
    },
    [addToHistory, clearOutput, isConnected, connect, connectors]
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
