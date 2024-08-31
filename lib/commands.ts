import { config } from "@/app/config";

type CommandFunction = (args: string[]) => Promise<string>;

interface Commands {
  [key: string]: CommandFunction;
}

export const commands: Commands = {
  help: async (args: string[]): Promise<string> => {
    const commandList = Object.keys(commands).sort().join(", ");
    return `Available commands: ${commandList}`;
  },

  echo: async (args: string[]): Promise<string> => {
    return args.join(" ");
  },

  whoami: async (args: string[]): Promise<string> => {
    return `${config.ps1_username}`;
  },

  date: async (args: string[]): Promise<string> => {
    return new Date().toString();
  },

  github: async (args: string[]): Promise<string> => {
    window.open(`https://github.com/${config.social.github}/`);
    return "Opening github...";
  },

  twitter: async (args: string[]): Promise<string> => {
    window.open(`https://twitter.com/${config.social.twitter}/`);
    return "Opening linkedin...";
  },

  google: async (args: string[]): Promise<string> => {
    window.open(`https://google.com/search?q=${args.join(" ")}`);
    return `Searching google for ${args.join(" ")}...`;
  },

  clear: async (args: string[]): Promise<string> => {
    return "clear";
  },
};

// Banner
export const BANNER = `
 __     __   ______   ______  ______  ______   ______   __    __   
/\ \  _ \ \ /\  ___\ /\  == \/\__  _\/\  ___\ /\  == \ /\ "-./  \  
\ \ \/ ".\ \\ \  __\ \ \  __<\/_/\ \/\ \  __\ \ \  __< \ \ \-./\ \ 
 \ \__/".~\_\\ \_____\\ \_____\ \ \_\ \ \_____\\ \_\ \_\\ \_\ \ \_\
  \/_/   \/_/ \/_____/ \/_____/  \/_/  \/_____/ \/_/ /_/ \/_/  \/_/
  
Type 'help' to see the list of available commands.
`;
