import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { monadTestnet } from "@/lib/config";

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "Farmora",
  projectId,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
