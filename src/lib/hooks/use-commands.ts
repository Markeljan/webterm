import { useCallback } from "react";

import { formatUnits } from "viem";
import { useAccount, useBalance, useConnect } from "wagmi";

import { fhenix } from "@/lib/config-web3";
import { useFhenix } from "@/lib/hooks/use-fhenix";
import { stringifyBigInt } from "@/lib/utils";

const CONNECT_WARNING = "No wallet connected, try 'connect'";
const PERMIT_WARNING = "No recent permit found, try 'getPermit'";

export const useCommands = () => {
  const { isConnected, address } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: {
      structuralSharing: false,
    },
  });

  const formattedBalance = balance && `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`;
  const { connectors, connect } = useConnect();
  const {
    permit,
    postCount,
    txHash,
    sealedPost,
    sealedPostError,
    postId,
    setPostId,
    encryptString,
    addPost,
    handleGetPermit,
    getUnsealedPost,
  } = useFhenix();

  const commands: Record<string, (args: string[]) => Promise<string> | string> = {
    help: async (args: string[]): Promise<string> => {
      const commandList = Object.keys(commands).sort().join(", ");
      return `available commands: ${commandList}`;
    },

    connect: async (args: string[]): Promise<string> => {
      if (!isConnected) {
        connect({ connector: connectors[0], chainId: fhenix.id });
        return "Connecting...";
      } else {
        return "Already connected.";
      }
    },

    address: async (args: string[]): Promise<string> => {
      return address || "anon";
    },

    balance: async (args: string[]): Promise<string> => {
      return formattedBalance || "Unable to fetch balance";
    },

    docs: async (args: string[]): Promise<string> => {
      window.open(`https://docs.fhenix.zone/docs/devdocs/intro`, "_blank");
      return "Opening docs...";
    },

    google: async (args: string[]): Promise<string> => {
      window.open(`https://google.com/search?q=${args.join(" ")}`, "_blank");
      return `Searching google for ${args.join(" ")}...`;
    },

    github: async (args: string[]): Promise<string> => {
      window.open(`https://github.com/fhenixprotocol/`, "_blank");
      return "Opening github...";
    },

    clear: (args: string[]): string => {
      return "";
    },

    getPostCount: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      return (postCount || 0).toString();
    },

    getPermit: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      const activePermit = permit || (await handleGetPermit());
      if (!activePermit) return "No recent permit found";

      return stringifyBigInt({
        ...activePermit,
        sealingKey: {
          ...activePermit.sealingKey,
          privateKey: "omitted",
        },
      });
    },

    getHash: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (txHash) {
        const txUrl = `https://explorer.helium.fhenix.zone/tx/${txHash}?tab=index`;
        window.open(txUrl, "_blank");
        return txUrl;
      } else {
        return "No recent hash found";
      }
    },

    addPost: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (!permit) return PERMIT_WARNING;
      const encryptedString = await encryptString(args[0]);
      if (!encryptedString) {
        return "Failed to encrypt string";
      } else {
        let output = `ENCRYPTED STRING: ${stringifyBigInt(encryptedString)}\n`;
        await addPost(encryptedString);
        return output + "Pending transaction";
      }
    },

    encryptString: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (!permit) return PERMIT_WARNING;
      const encrypted = await encryptString(args[0]);
      return stringifyBigInt(encrypted) || "Failed to encrypt string";
    },

    setPostId: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (!permit) return PERMIT_WARNING;
      const newPostId = args[0] ? BigInt(args[0]) : postId;
      setPostId(newPostId);
      return `Post ID set to ${newPostId}`;
    },

    getPost: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (!permit) return PERMIT_WARNING;
      if (sealedPost) return `SEALED: ${stringifyBigInt(sealedPost)}`;
      if (sealedPostError) return `ERROR: ${stringifyBigInt(sealedPostError)}`;
      return "Error fetching post";
    },

    unsealPost: async (args: string[]): Promise<string> => {
      if (!isConnected) return CONNECT_WARNING;
      if (!permit) return PERMIT_WARNING;
      const { unsealedData, unsealedError } = getUnsealedPost();
      if (unsealedData) return `UNSEALED: ${stringifyBigInt(unsealedData)}`;
      if (unsealedError) return `ERROR: ${unsealedError}`;
      return "Error unsealing post";
    },
  };

  const validateCommand = useCallback(
    (command: string): boolean => {
      return command in commands;
    },
    [commands]
  );

  const commandList = Object.keys(commands);

  const executeCommand = useCallback(
    async (commandName: string, args: string[]): Promise<string> => {
      try {
        return commands[commandName](args);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "commands[commandName] is not a function") return `command not found: ${commandName}`;
          console.error("error", error.message);
          return `command error: ${error.message}`;
        } else {
          console.error("COMMAND_ERROR", error);
          return `command error: unknown error`;
        }
      }
    },
    [commands]
  );

  return {
    commandList,
    validateCommand,
    executeCommand,
  };
};
