import { commands } from "@/lib/commands";

export const shell = async (
  command: string,
  setHistory: (value: string) => void,
  clearHistory: () => void,
  setCommand: React.Dispatch<React.SetStateAction<string>>
) => {
  const args = command.split(" ");
  const cmd = args[0].toLowerCase();
  switch (cmd) {
    case "clear":
      clearHistory();
      break;
    case "":
      setHistory("");
      break;
    default:
      if (cmd in commands) {
        const output = await commands[cmd](args.slice(1));
        if (output === "clear") {
          clearHistory();
        } else {
          setHistory(output);
        }
        break;
      }
      setHistory(`shell: command not found: ${cmd}. Try 'help' to get started.`);
      break;
  }

  setCommand("");
};
