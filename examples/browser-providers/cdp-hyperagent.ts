/**
 * # CDP HyperAgent Example
 *
 * This example demonstrates how to use HyperAgent with CDP for AI-powered web automation.
 * The agent will perform complex web tasks using an existing Chrome browser instance.
 *
 * ## What This Example Does
 *
 * The agent connects to Chrome via CDP and:
 * 1. Goes to Google.com
 * 2. Searches for "CDP browser automation"
 * 3. Extracts the title of the first search result
 * 4. Uses AI to understand and process the web content
 *
 * ## Prerequisites
 *
 * 1. Node.js environment
 * 2. OpenAI API key set in your .env file (OPENAI_API_KEY)
 * 3. Chrome/Chromium running with remote debugging enabled:
 *    ```bash
 *    chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
 *    ```
 *
 * ## Running the Example
 *
 * ```bash
 * npx tsx examples/browser-providers/cdp-hyperagent.ts
 * ```
 */

import "dotenv/config";
import { HyperAgent } from "../../src";
import { ChatOpenAI } from "@langchain/openai";

async function main() {
  console.log("🤖 CDP HyperAgent AI Automation Example\n");
  
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
      model: "gpt-4o-mini", // Using mini for cost efficiency in examples
      temperature: 0,
    });

    // Create HyperAgent with CDP provider
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

    console.log("🚀 Executing AI-powered web automation task...");
    
    const response = await agent.executeTask(
      "Go to google.com and search for 'CDP browser automation'. Then tell me the title of the first search result."
    );

    console.log("\n🎉 Task completed!");
    console.log("📋 Response:", response.output);
    
    // Close the agent
    await agent.closeAgent();
    console.log("🧹 CDP HyperAgent session closed.");
    
  } catch (error) {
    console.error("❌ Error using CDP HyperAgent:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        console.error("\n🔧 Connection failed. Make sure Chrome is running with:");
        console.error("   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0");
        console.error("\n📝 Or check if Chrome DevTools is accessible at:");
        console.error("   http://localhost:9222");
      } else if (error.message.includes("LLM") || error.message.includes("OpenAI")) {
        console.error("\n🔧 LLM Error. Make sure your OpenAI API key is valid:");
        console.error("   export OPENAI_API_KEY=your_api_key_here");
      }
    }
    
    console.error("\n💡 Alternative: Use Docker to run Chrome:");
    console.error("   docker run -d --rm --name chrome-cdp -p 9222:9222 \\");
    console.error("     zenika/alpine-chrome:latest \\");
    console.error("     --no-sandbox --remote-debugging-address=0.0.0.0 \\");
    console.error("     --remote-debugging-port=9222 --disable-gpu");
  }
}

if (require.main === module) {
  main().catch(console.error);
}
