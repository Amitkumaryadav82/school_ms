import { ReactNode } from 'react';

export interface ConnectionState {
  connected: boolean;
  checking: boolean;
  lastChecked: Date | null;
  apiUrl: string;
  workingUrl: string | null;
  error: string | null;
}

export interface ConnectionContextType {
  connectionState: ConnectionState;
  checkConnection: () => Promise<boolean>;
  updateApiUrl: (newUrl: string) => Promise<boolean>;
  resetToDefaultUrl: () => Promise<void>;
  showConnectionSettings: boolean;
  setShowConnectionSettings: (show: boolean) => void;
}

export declare const ConnectionProvider: ({ children }: { children: ReactNode }) => JSX.Element;
export declare const useConnection: () => ConnectionContextType;
export declare const ConnectionContext: React.Context<ConnectionContextType | undefined>;

export default ConnectionContext;
