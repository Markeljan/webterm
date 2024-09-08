import { useCallback, useMemo, useState } from "react";

import { useAccount } from "wagmi";

import { useCommands } from "@/lib/hooks/use-commands";

export type HistoryItem = {
  value: string;
  ps1?: string;
  isValidCommand?: boolean;
};

const INITIAL_HISTORY = [
  {
    value: "WEBTERM type 'help' to see the list of available commands",
  },
];

export const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const { address, chain } = useAccount();
  const { commandList, executeCommand, validateCommand } = useCommands();

  const ps1 = useMemo(() => {
    const username = address ? `${address.slice(0, 6)}_${address.slice(-4)}` : "anon";
    const hostname = chain ? `${chain.name}` : "webterm";
    return `${username}@${hostname}`.replace(" ", "");
  }, [address, chain]);

  const addToHistory = useCallback(
    (commandName: string, commandInput: string, output: string) => {
      setHistory((prev) => [
        ...prev,
        { ps1, value: commandInput, isValidCommand: validateCommand(commandName) },
        ...(commandInput ? [{ value: output }] : []),
      ]);
      if (commandInput) setCommandHistory((prev) => [...prev, commandInput]);
      setCommandHistoryIndex(-1);
      setCommand("");
    },
    [ps1, validateCommand]
  );

  const navigateHistory = useCallback(
    (key: "ArrowUp" | "ArrowDown") => {
      if (key === "ArrowUp" && commandHistoryIndex < commandHistory.length - 1) {
        const newIndex = commandHistoryIndex + 1;
        setCommandHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (key === "ArrowDown" && commandHistoryIndex >= 0) {
        const newIndex = commandHistoryIndex - 1;
        setCommandHistoryIndex(newIndex);
        setCommand(newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex]);
      }
    },
    [commandHistory, commandHistoryIndex]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setCommand(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setCommandHistory((prev) => [...prev, "clear"]);
    setHistory(INITIAL_HISTORY);
    setCommand("");
  }, []);

  const handleSubmitCommand = useCallback(async () => {
    const commandInput = command.trim();
    const [commandName, ...args] = commandInput.split(" ");
    if (commandInput === "") return addToHistory(commandName, commandInput, "");
    if (commandName === "clear") return handleClear();
    const output = await executeCommand(commandName, args);
    addToHistory(commandName, commandInput, output);
  }, [addToHistory, executeCommand]);

  const handleTabCompletion = useCallback(() => {
    if (command.length === 0) return;

    const commandMatches = commandList
      .filter((entry) => entry.startsWith(command) && entry !== command)
      .sort((a, b) => a.length - b.length);

    if (commandMatches.length === 0) return;

    setCommand(commandMatches[0]);
  }, [command, commandList]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          navigateHistory(event.key);
          break;
        case "Tab":
          event.preventDefault();
          handleTabCompletion();
          break;
        case "Enter":
          handleSubmitCommand();
          break;
      }
    },
    [command, handleSubmitCommand, navigateHistory, handleTabCompletion]
  );

  return {
    ps1,
    command,
    history,
    handleChange,
    handleKeyDown,
    validateCommand,
  };
};
