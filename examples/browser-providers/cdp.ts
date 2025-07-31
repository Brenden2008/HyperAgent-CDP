/**
 * # CDP (Chrome DevTools Protocol) Browser Provider Example
 *
 * This example demonstrates how to configure and use HyperAgent with the CDP
 * browser provider for connecting to an existing Chrome/Chromium instance.
 *
 * ## What This Example Does
 *
 * The agent connects to a Chrome browser via CDP and:
 * 1. Configures HyperAgent with CDP-specific settings
 * 2. Connects to an existing Chrome instance via WebSocket
 * 3. Navigates to a website and extracts basic information
 *
 * ## Prerequisites
 *
 * 1. Node.js environment
 * 2. OpenAI API key set in your .env file (OPENAI_API_KEY)
 * 3. Chrome/Chromium running with remote debugging enabled:
 *    ```bash
 *    chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
 *    ```
 *    Or in headless mode:
 *    ```bash
 *    chrome --headless --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
 *    ```
 *
 * ## Running the Example
 *
 * ```bash
 * npx tsx examples/browser-providers/cdp.ts
 * ```
 */

import "dotenv/config";
import { HyperAgent } from "../../src";
import { ChatOpenAI } from "@langchain/openai";

async function main() {
  console.log("🚀 CDP Browser Provider Example\n");
  
  // Check if we have an OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable is required");
    console.error("   Please set your OpenAI API key in the environment");
    process.exit(1);
  }

  try {
    console.log("Creating HyperAgent with CDP browser provider...");
    
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini", // Using mini for cost efficiency
      temperature: 0,
    });

    const agent = new HyperAgent({
      llm: llm,
      browserProvider: "CDP",
      cdpConfig: {
        wsEndpoint: "ws://localhost:9222/devtools/browser",
        options: {
          timeout: 30000,
        }
      },
      debug: true,
    });

    console.log("📡 Initializing CDP browser connection...");
    const browser = await agent.initBrowser();
    
    console.log("✅ CDP browser connected successfully!");
    
    // Create a new page and navigate to a website
    const context = browser.contexts()[0] || await browser.newContext();
    const page = await context.newPage();
    
    console.log("🌐 Navigating to example.com...");
    await page.goto("https://example.com");
    
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Get the page content
    const content = await page.textContent('body');
    console.log(`📝 Page contains ${content?.length || 0} characters of text`);
    
    // Close the agent
    await agent.closeAgent();
    console.log("🧹 CDP browser connection closed.");
    console.log("🎉 Example completed successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error instanceof Error && error.message.includes("connect")) {
      console.error("\n🔧 Connection failed. Make sure Chrome is running with:");
      console.error("   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0");
      console.error("\n📝 Or check if Chrome DevTools is accessible at:");
      console.error("   http://localhost:9222");
      console.error("\n💡 Alternative: Use Docker to run Chrome:");
      console.error("   docker run -d --rm --name chrome-cdp -p 9222:9222 \\");
      console.error("     zenika/alpine-chrome:latest \\");
      console.error("     --no-sandbox --remote-debugging-address=0.0.0.0 \\");
      console.error("     --remote-debugging-port=9222 --disable-gpu");
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}
