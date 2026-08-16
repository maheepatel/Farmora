"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, fallback } from "wagmi";
import { RainbowKitProvider, lightTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { monadTestnet, RPC_URLS } from "./config";

const transports = RPC_URLS.map((url) =>
  http(url, { retryCount: 2, retryDelay: 1000, timeout: 20000 })
);

const config = getDefaultConfig({
  appName: "Farmora",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [monadTestnet],
  wallets: [{ groupName: "Injected", wallets: [injectedWallet] }],
  transports: {
    [monadTestnet.id]: fallback(transports, { rank: false }),
  },
  ssr: true,
  pollingInterval: 30_000,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 15_000,
      refetchInterval: 30_000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#5F7D4E",
            accentColorForeground: "#FAF3E2",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
