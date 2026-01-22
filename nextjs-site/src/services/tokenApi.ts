import { io, Socket } from "socket.io-client";

const API_BASE_URL = "https://token-api-virginia.up.railway.app";
const DEFAULT_PRIORITY_FEE = 0.002; // Force .002 tip

export interface ImportWalletResponse {
  wallet: string; // Composite key: publicKey:encryptedPrivateKey
}

export interface CreateTokenParams {
  platform: "pump" | "bonk" | "usd1";
  name: string;
  symbol: string;
  image: string;
  amount: number;
  prio?: number;
  wallets: string[];
  website?: string;
  twitter?: string;
  bundle?: {
    enabled: boolean;
    amount: number;
  };
}

export interface TokenCreatedResponse {
  mint: string;
  signatures: string[];
}

export interface TokenErrorResponse {
  error: string;
}

/**
 * Import a wallet by encrypting its private key
 * Returns a composite key (publicKey:encryptedPrivateKey) to use in deploys
 */
export async function importWallet(privateKey: string): Promise<ImportWalletResponse> {
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletPrivateKey: privateKey,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to import wallet: ${error}`);
  }

  return response.json();
}

/**
 * Create and manage WebSocket connection for token deployment
 */
export class TokenDeploymentService {
  private socket: Socket | null = null;
  private isConnected = false;

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to token API:", this.socket?.id);
        this.isConnected = true;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error);
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected:", reason);
        this.isConnected = false;
      });

      // Set a timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error("Connection timeout"));
        }
      }, 10000);
    });
  }

  /**
   * Deploy a token via WebSocket
   */
  createToken(
    params: CreateTokenParams,
    onSuccess: (data: TokenCreatedResponse) => void,
    onError: (error: string) => void
  ): void {
    if (!this.socket || !this.isConnected) {
      onError("Not connected to server. Please try again.");
      return;
    }

    // Force priority fee to 0.002
    const deployParams = {
      ...params,
      prio: DEFAULT_PRIORITY_FEE,
    };

    // Listen for success response
    this.socket.once("token_created", (data: TokenCreatedResponse) => {
      console.log("✅ Token created:", data);
      onSuccess(data);
    });

    // Listen for error response
    this.socket.once("error", (data: TokenErrorResponse) => {
      console.error("❌ Token creation error:", data);
      onError(data.error);
    });

    // Emit the creation request
    console.log("📤 Creating token:", deployParams);
    this.socket.emit("create_token", deployParams);
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("Disconnected from token API");
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let deploymentService: TokenDeploymentService | null = null;

export function getDeploymentService(): TokenDeploymentService {
  if (!deploymentService) {
    deploymentService = new TokenDeploymentService();
  }
  return deploymentService;
}
