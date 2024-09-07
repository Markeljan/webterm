import { useEffect, useState } from "react";

import { EncryptedUint32, FhenixClient, getPermit, Permit, PermitSigner } from "fhenixjs";
import { Hash } from "viem";
import { useReadContract, useWalletClient, useWriteContract } from "wagmi";

import { fhenix } from "@/lib/config-web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";

export const useFhenix = () => {
  const [fhenixClient, setFhenixClient] = useState<FhenixClient>();
  const [permit, setPermit] = useState<Permit>();
  const { data: walletClient } = useWalletClient();
  const { data: writehash, writeContract, isPending, isSuccess } = useWriteContract();
  const { data: postCount } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "postCount",
  });
  const {
    data: sealedPost,
    status,
    error,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getSealedPost",
    args: [
      0n,
      {
        publicKey: permit?.publicKey as `0x${string}`,
        signature: permit?.signature as `0x${string}`,
      },
    ],
    account: walletClient?.account.address,
  });
  const {
    data: postLength,
    status: postLengthStatus,
    error: postLengthError,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getPostLength",
    args: [1n],
    account: walletClient?.account.address,
  });

  const res = {
    "0": 222,
    "1": 237,
    "2": 190,
    "3": 175,
    "4": 246,
    "5": 34,
    "6": 48,
    "7": 38,
    "8": 149,
    "9": 99,
    "10": 248,
    "11": 225,
    "12": 82,
    "13": 56,
    "14": 62,
    "15": 31,
    "16": 203,
    "17": 170,
    "18": 99,
    "19": 33,
    "20": 32,
    "21": 194,
    "22": 234,
    "23": 66,
    "24": 30,
    "25": 118,
    "26": 233,
    "27": 1,
    "28": 70,
    "29": 61,
    "30": 163,
    "31": 135,
  };

  const resArrayBuffer = Buffer.from(Object.values(res));

  const unsealPostLength = async () => {
    if (!permit || !postLength) {
      return;
    }
    return permit.sealingKey.unseal("100833511215555060177892115098218934217379997175525989106282759397471948743559");
  };

  const addPost = async (encryptedString: { data: Hash }[]) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "addPost",
      args: [encryptedString],
    });
  };

  console.log("walletClient.account.getAddress()", walletClient?.account.address);

  useEffect(() => {
    const loadFhenix = async () => {
      if (!walletClient) {
        return;
      }
      const fhenixClient = new FhenixClient({ provider: walletClient.transport });
      setFhenixClient(fhenixClient);

      const signingProvider: PermitSigner = {
        getAddress: async () => (await walletClient.getAddresses())[0],
        signTypedData: walletClient.signTypedData,
      };

      let permit = await getPermit(
        CONTRACT_ADDRESS,
        {
          ...walletClient.transport,
          getSigner: async (addressOrIndex?: string | number) => {
            return {
              getAddress: () => walletClient.account.address,
              signTypedData: (
                domain: {},
                types: {
                  Permissioned: { name: string; type: string }[];
                },
                content: { publicKey: string }
              ) => {
                return walletClient.signTypedData({
                  account: walletClient.account.address,
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
        },
        true
      );

      console.log("permit", permit);
      if (!permit) {
        permit = await fhenixClient.generatePermit(CONTRACT_ADDRESS, undefined, signingProvider);
        console.log("generated permit", permit);
      }
      setPermit(permit);
    };
    if (walletClient && !fhenixClient) {
      console.log("Loading fhenix client");
      loadFhenix();
    }
  }, [walletClient]);

  const encryptString = async (stringToEncrypt: string): Promise<{ data: Hash }[] | undefined> => {
    if (!fhenixClient) {
      console.log("No fhenix client");
      return;
    }
    // Convert the string to an array of character codes
    const charCodes = stringToEncrypt.split("").map((char) => char.charCodeAt(0));
    // Encrypt each character code
    const encryptedChars = await Promise.all(charCodes.map((code) => fhenixClient.encrypt_uint32(code)));
    console.log(encryptedChars);
    // The resulting array of encrypted uint32 values represents your EString
    const encryptedString = formatForContractCall(encryptedChars);
    return encryptedString;
  };

  function formatForContractCall(encryptedString: EncryptedUint32[]): { data: Hash }[] {
    return encryptedString.map((encNum) => ({ data: `0x${Buffer.from(encNum.data).toString("hex")}` }));
  }

  return { encryptString, addPost, unsealPostLength };
};
