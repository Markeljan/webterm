import { getAllUsers, getOrCreateUser } from "@/actions/db";
import { terminalConfig } from "@/lib/config";

type CommandFunction = (args: string[]) => Promise<string>;

type Commands = {
  [key: string]: CommandFunction;
};

export const commands: Commands = {
  help: async (args: string[]): Promise<string> => {
    const commandList = Object.keys(commands).sort().join(", ");
    return `Available commands: ${commandList}`;
  },

  echo: async (args: string[]): Promise<string> => {
    return args.join(" ");
  },

  whoami: async (args: string[]): Promise<string> => {
    return `${terminalConfig.ps1_username}`;
  },

  date: async (args: string[]): Promise<string> => {
    return new Date().toString();
  },

  github: async (args: string[]): Promise<string> => {
    window.open(`https://github.com/${terminalConfig.social.github}/`, "_blank");
    return "Opening github...";
  },

  twitter: async (args: string[]): Promise<string> => {
    window.open(`https://twitter.com/${terminalConfig.social.twitter}/`, "_blank");
    return "Opening linkedin...";
  },

  google: async (args: string[]): Promise<string> => {
    window.open(`https://google.com/search?q=${args.join(" ")}`, "_blank");
    return `Searching google for ${args.join(" ")}...`;
  },

  clear: async (args: string[]): Promise<string> => {
    return "clear";
  },
  connect: async (args: string[]): Promise<string> => {
    const id = args[0];
    const user = await getOrCreateUser(id);
    return `Connected to user ${user.id}`;
  },
  ls: async (args: string[]): Promise<string> => {
    const users = await getAllUsers();
    return users.map((user) => user.id).join("\n");
  },
};

export const BANNER = `WEBTERM Type 'help' to see the list of available commands.`;

const commandsMap = new Map(Object.entries(commands));

export const isValidCommand = (command: string): boolean => {
  return commandsMap.has(command);
};
