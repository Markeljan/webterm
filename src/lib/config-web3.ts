import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

export const fhenix = defineChain({
  id: 8008135,
  name: "Fhenix Helium",
  rpcUrls: {
    default: {
      http: ["https://api.helium.fhenix.zone"],
      webSocket: ["wss://api.helium.fhenix.zone:8548"],
    },
  },
  blockExplorers: {
    default: {
      name: "Fhenix Helium Explorer",
      apiUrl: "https://explorer.helium.fhenix.zone/api/v2",
      url: "https://explorer.helium.fhenix.zone",
    },
  },
  network: "fhenix",
  nativeCurrency: {
    decimals: 18,
    name: "Fhenix",
    symbol: "tFHE",
  },
  testnet: true,
});

const PROJECT_ID = (() => {
  const key = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (!key) {
    throw new Error("WALLETCONNECT_PROJECT_ID is not set");
  }
  return key;
})();

export const config = createConfig({
  chains: [fhenix],
  connectors: [injected(), walletConnect({ projectId: PROJECT_ID }), metaMask(), safe()],
  transports: {
    [fhenix.id]: http(fhenix.rpcUrls.default.http[0]),
  },
  ssr: true,
});
