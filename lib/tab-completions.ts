import { commands } from "@/lib/commands";

export const handleTabCompletion = (command: string, setCommand: React.Dispatch<React.SetStateAction<string>>) => {
  const availableCommands = Object.keys(commands).filter((entry) => entry.startsWith(command));

  if (availableCommands.length === 1) {
    setCommand(availableCommands[0]);
  }
};
