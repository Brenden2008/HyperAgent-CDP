import { chromium, Browser, ConnectOverCDPOptions } from "playwright";
import BrowserProvider from "@/types/browser-providers/types";

export interface CDPBrowserConfig {
  wsEndpoint: string;
  options?: Omit<ConnectOverCDPOptions, "endpointURL">;
  debug?: boolean;
}

export class CDPBrowserProvider extends BrowserProvider<Browser> {
  wsEndpoint: string;
  options: Omit<ConnectOverCDPOptions, "endpointURL"> | undefined;
  session: Browser | undefined;
  debug: boolean;

  constructor(config: CDPBrowserConfig = { wsEndpoint: "" }) {
    super();
    if (!config.wsEndpoint) {
      throw new Error("CDP wsEndpoint is required but was not provided");
    }
    this.wsEndpoint = config.wsEndpoint;
    this.options = config.options;
    this.debug = config.debug ?? false;
  }

  async start(): Promise<Browser> {
    if (this.debug) {
      console.log("\nConnecting to CDP WebSocket endpoint:", this.wsEndpoint);
    }

    // Validate the WebSocket endpoint format
    if (!this.wsEndpoint.startsWith('ws://') && !this.wsEndpoint.startsWith('wss://')) {
      throw new Error(`Invalid CDP WebSocket endpoint format: ${this.wsEndpoint}. Must start with ws:// or wss://`);
    }

    try {
      const browser = await chromium.connectOverCDP({
        endpointURL: this.wsEndpoint,
        ...this.options
      });
      this.session = browser;

      if (this.debug) {
        console.log("Successfully connected to CDP browser\n");
        // Log some basic info about the connected browser
        const contexts = browser.contexts();
        console.log(`Connected browser has ${contexts.length} context(s)`);
      }

      return this.session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.debug) {
        console.error("Failed to connect to CDP browser:", errorMessage);
        console.error("Make sure Chrome/Chromium is running with --remote-debugging-port flag");
        console.error("Example: chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0");
      }
      throw new Error(`Failed to connect to CDP WebSocket endpoint: ${this.wsEndpoint}. ${errorMessage}`);
    }
  }

  async close(): Promise<void> {
    if (this.debug && this.session) {
      console.log("Closing CDP browser connection");
    }
    await this.session?.close();
  }

  public getSession() {
    if (!this.session) {
      return null;
    }
    return this.session;
  }
}
