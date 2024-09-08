import { useCallback, useEffect, useMemo, useState } from "react";

import { EncryptedUint32, FhenixClient, getPermit, Permit, PermitSigner } from "fhenixjs";
import { Hash } from "viem";
import { useReadContract, useWalletClient, useWriteContract } from "wagmi";

import { fhenix } from "@/lib/config-web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";

export const useFhenix = () => {
  const [fhenixClient, setFhenixClient] = useState<FhenixClient>();
  const [postId, setPostId] = useState<bigint>(0n);
  const [permit, setPermit] = useState<Permit | undefined>();
  const { data: walletClient } = useWalletClient();
  const address = walletClient?.account.address;
  const { data: txHash, writeContract } = useWriteContract();
  const { data: postCount } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "postCount",
  });
  const {
    data: sealedPost,
    error: sealedPostError,
    dataUpdatedAt,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getSealedPost",
    args: [
      postId,
      {
        publicKey: permit?.publicKey as `0x${string}`,
        signature: permit?.signature as `0x${string}`,
      },
    ],
    account: address,
    query: {
      enabled: !!permit && !!postId && !!address,
    },
  });

  const getUnsealedPost = useCallback(() => {
    if (!permit || !sealedPost) {
      return {
        unsealedData: null,
        unsealedError: "Missing permit or sealed post",
      };
    }

    try {
      const unsealedChars = sealedPost.map((sealedChar) => permit.sealingKey.unseal(sealedChar));
      const unsealedCharCodes = unsealedChars.join(" ");
      // Convert the unsealed character codes back to a string
      const decryptedPost = String.fromCharCode(...unsealedChars.map(Number));

      return {
        unsealedData: { unsealedCharCodes, decryptedPost },
        unsealedError: null,
      };
    } catch (error) {
      console.error("Error unsealing post:", error);
      const errorMessage = error instanceof Error ? error.message : `Unknown error unsealing post: ${postId}`;
      return { unsealedData: null, unsealedError: errorMessage };
    }
  }, [sealedPost, permit, permit]);

  const addPost = async (encryptedString: { data: Hash }[]) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "addPost",
      args: [encryptedString],
    });
  };

  useEffect(() => {
    const loadFhenix = () => {
      if (!walletClient || !address) {
        return;
      }
      const fhenixClient = new FhenixClient({ provider: walletClient.transport });
      setFhenixClient(fhenixClient);
      setPermit(fhenixClient.getPermit(CONTRACT_ADDRESS, address));
    };
    if (walletClient && !fhenixClient) {
      loadFhenix();
    }
  }, [walletClient]);

  const fhenixPermitProvider = useMemo(() => {
    if (!walletClient || !address) return;
    return {
      ...walletClient.transport,
      getSigner: async () => {
        return {
          getAddress: () => address,
          signTypedData: (
            domain: {},
            types: {
              Permissioned: { name: string; type: string }[];
            },
            content: { publicKey: string }
          ) => {
            return walletClient.signTypedData({
              account: address,
              domain: {
                ...domain,
                chainId: fhenix.id,
              },
              types,
              primaryType: "Permissioned",
              message: {
                publicKey: content.publicKey,
              },
            });
          },
        };
      },
    };
  }, [walletClient, address]);

  const handleGetPermit = async (): Promise<Permit | null> => {
    if (!walletClient || !fhenixClient || !fhenixPermitProvider) {
      console.error("Missing fhenix client or fhenix permit provider");
      return null;
    }

    const permitSigner: PermitSigner = {
      getAddress: async () => (await walletClient.getAddresses())[0],
      signTypedData: walletClient.signTypedData,
    };
    let permit: Permit | null;
    try {
      permit = await getPermit(CONTRACT_ADDRESS, fhenixPermitProvider, true);
    } catch (error) {
      console.error("Error getting permit:", error);
      permit = await fhenixClient.generatePermit(CONTRACT_ADDRESS, fhenixPermitProvider, permitSigner);
    }
    if (!permit) {
      console.error("No permit found");
      return null;
    }

    fhenixClient.storePermit(permit);
    setPermit(permit);
    return permit;
  };

  const encryptString = async (stringToEncrypt: string): Promise<{ data: Hash }[] | undefined> => {
    if (!fhenixClient) {
      return;
    }
    // Convert the string to an array of character codes
    const charCodes = stringToEncrypt?.split("")?.map((char) => char.charCodeAt(0));
    if (!charCodes) {
      return;
    }
    // Encrypt each character code
    const encryptedChars = await Promise.all(charCodes?.map((code) => fhenixClient.encrypt_uint32(code)));

    // The resulting array of encrypted uint32 values represents your EString
    const encryptedString = formatForContractCall(encryptedChars);
    return encryptedString;
  };

  function formatForContractCall(encryptedString: EncryptedUint32[]): { data: Hash }[] {
    return encryptedString.map((encNum) => ({ data: `0x${Buffer.from(encNum.data).toString("hex")}` }));
  }

  return {
    encryptString,
    addPost,
    setPostId,
    handleGetPermit,
    postId,
    postCount,
    txHash,
    permit,
    sealedPost,
    sealedPostError,
    getUnsealedPost,
  };
};
