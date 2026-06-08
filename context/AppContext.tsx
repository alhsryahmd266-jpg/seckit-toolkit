import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_TOKEN = "";

interface AppContextType {
  serverUrl: string;
  token: string;
  isConnected: boolean;
  setServerUrl: (url: string) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  testConnection: () => Promise<boolean>;
  callTool: (endpoint: string, method?: string, body?: object) => Promise<any>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [serverUrl, setServerUrlState] = useState("");
  const [token, setTokenState] = useState(DEFAULT_TOKEN);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const savedUrl = await AsyncStorage.getItem("server_url");
      const savedToken = await AsyncStorage.getItem("api_token");
      if (savedUrl) setServerUrlState(savedUrl);
      if (savedToken) setTokenState(savedToken);
      else {
        setTokenState(DEFAULT_TOKEN);
        await AsyncStorage.setItem("api_token", DEFAULT_TOKEN);
      }
    })();
  }, []);

  const setServerUrl = async (url: string) => {
    setServerUrlState(url);
    await AsyncStorage.setItem("server_url", url);
    setIsConnected(false);
  };

  const setToken = async (t: string) => {
    setTokenState(t);
    await AsyncStorage.setItem("api_token", t);
  };

  const testConnection = async (): Promise<boolean> => {
    if (!serverUrl) return false;
    try {
      const res = await fetch(`${serverUrl}/health`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });
      const ok = res.ok;
      setIsConnected(ok);
      return ok;
    } catch {
      setIsConnected(false);
      return false;
    }
  };

  const callTool = async (endpoint: string, method = "GET", body?: object) => {
    if (!serverUrl) throw new Error("Server URL not configured — go to Settings");
    const res = await fetch(`${serverUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  };

  return (
    <AppContext.Provider
      value={{ serverUrl, token, isConnected, setServerUrl, setToken, testConnection, callTool }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
