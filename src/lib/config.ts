import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const fhenix = defineChain({
  id: 8008135,
  name: "Fhenix Helium",
  rpcUrls: {
    default: {
      http: ["https://api.helium.fhenix.zone"],
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
});
const projectId = "<WALLETCONNECT_PROJECT_ID>";

export const config = createConfig({
  chains: [fhenix],
  connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],
  transports: {
    [fhenix.id]: http(fhenix.rpcUrls.default.http[0]),
  },
});

export const terminalConfig = {
  readmeUrl: "https://raw.githubusercontent.com/markeljan/webterm/main/readme.md",
  title: "WebTerm",
  name: "Anon Doe",
  ascii: "webterm",
  social: {
    github: "markeljan",
    twitter: "0xSoko",
  },
  ps1_hostname: "webterm",
  ps1_username: "anon",
  repo: "https://github.com/markeljan/webterm",
};
