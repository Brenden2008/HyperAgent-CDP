#!/usr/bin/env npx tsx

/**
 * # Simple CDP Example
 * 
 * This is the simplest possible example of using HyperAgent with CDP.
 * Before running this, make sure Chrome is running with remote debugging:
 * 
 * chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
 * 
 * Or in headless mode:
 * chrome --headless --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
 * 
 * Or using Docker:
 * docker run -d --rm --name chrome-cdp -p 9222:9222 \
 *   zenika/alpine-chrome:latest \
 *   --no-sandbox --remote-debugging-address=0.0.0.0 \
 *   --remote-debugging-port=9222 --disable-gpu
 */

import "dotenv/config";
import { HyperAgent } from "../../src";
import { ChatOpenAI } from "@langchain/openai";

async function main() {
  console.log("🚀 Starting simple CDP example...\n");

  // Check if we have an OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable is required");
    console.error("   Please set your OpenAI API key in the environment");
    process.exit(1);
  }

  try {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0,
    });

    // Create the agent with CDP configuration
    const agent = new HyperAgent({
      llm: llm,
      browserProvider: "CDP",
      cdpConfig: {
        wsEndpoint: "ws://localhost:9222/devtools/browser",
        options: {
          timeout: 10000, // 10 second timeout
        }
      },
      debug: true,
    });

    console.log("📡 Connecting to CDP browser...");
    
    // Get the current page (this will initialize the browser if needed)
    const page = await agent.getCurrentPage();
    
    console.log("✅ Connected successfully!");
    console.log("🌐 Navigating to example.com...");
    
    // Navigate to a simple page
    await page.goto("https://example.com");
    
    // Get the page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Take a screenshot (optional)
    console.log("📸 Taking screenshot...");
    await page.screenshot({ path: "cdp-test-screenshot.png" });
    console.log("💾 Screenshot saved as cdp-test-screenshot.png");
    
    // Clean up
    console.log("🧹 Closing browser connection...");
    await agent.closeAgent();
    
    console.log("🎉 CDP example completed successfully!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        console.error("\n🔧 Connection failed. Make sure Chrome is running with:");
        console.error("   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0");
        console.error("\n📝 Or check if Chrome DevTools is accessible at:");
        console.error("   http://localhost:9222");
        console.error("\n🐳 Or use Docker:");
        console.error("   docker run -d --rm --name chrome-cdp -p 9222:9222 \\");
        console.error("     zenika/alpine-chrome:latest \\");
        console.error("     --no-sandbox --remote-debugging-address=0.0.0.0 \\");
        console.error("     --remote-debugging-port=9222 --disable-gpu");
      } else if (error.message.includes("LLM") || error.message.includes("OpenAI")) {
        console.error("\n🔧 LLM Error. Make sure your OpenAI API key is valid:");
        console.error("   export OPENAI_API_KEY=your_api_key_here");
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}
