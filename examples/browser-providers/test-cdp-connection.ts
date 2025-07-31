#!/usr/bin/env npx tsx

import "dotenv/config";
import { HyperAgent } from "../../src";
import { ChatOpenAI } from "@langchain/openai";

async function testCDPConnection() {
  const endpoints = [
    "ws://localhost:9222/devtools/browser",
    "ws://localhost:9222",
    "ws://127.0.0.1:9222/devtools/browser", 
    "ws://127.0.0.1:9222"
  ];

  console.log("🔍 Testing CDP WebSocket endpoints...\n");

  // Create LLM instance (we won't actually use it for connection testing)  
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY || "test-key",
    model: "gpt-4o-mini",
    temperature: 0,
  });

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    
    try {
      const agent = new HyperAgent({
        llm: llm,
        browserProvider: "CDP",
        cdpConfig: {
          wsEndpoint: endpoint,
          options: {
            timeout: 5000, // 5 second timeout for quick testing
          }
        },
        debug: false, // Keep quiet for testing
      });

      const browser = await agent.initBrowser();
      console.log(`✅ SUCCESS: Connected to ${endpoint}`);
      
      // Test basic functionality
      const page = await agent.getCurrentPage();
      await page.goto("data:text/html,<h1>CDP Test Page</h1>");
      const title = await page.title();
      console.log(`   Page title: "${title}"`);
      
      await agent.closeAgent();
      console.log(`   Connection closed cleanly\n`);
      return endpoint; // Return the working endpoint
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ FAILED: ${errorMessage}\n`);
    }
  }

  return null;
}

async function main() {
  console.log("🚀 HyperAgent CDP Connection Test\n");
  
  // First, check if Chrome DevTools is accessible via HTTP
  console.log("📡 Checking Chrome DevTools availability...");
  try {
    const response = await fetch("http://localhost:9222/json/version");
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Chrome DevTools is running:`);
      console.log(`   Browser: ${data.Browser}`);
      console.log(`   WebSocket Debugger URL: ${data.webSocketDebuggerUrl}\n`);
    } else {
      console.log(`❌ Chrome DevTools HTTP endpoint returned status: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Chrome DevTools is not accessible at http://localhost:9222`);
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }

  const workingEndpoint = await testCDPConnection();
  
  if (workingEndpoint) {
    console.log(`🎉 SUCCESS! Use this endpoint in your CDP configuration:`);
    console.log(`   wsEndpoint: "${workingEndpoint}"\n`);
    
    console.log(`📝 Example configuration:`);
    console.log(`const agent = new HyperAgent({`);
    console.log(`  browserProvider: "CDP",`);
    console.log(`  cdpConfig: {`);
    console.log(`    wsEndpoint: "${workingEndpoint}",`);
    console.log(`    options: { timeout: 30000 }`);
    console.log(`  },`);
    console.log(`  debug: true`);
    console.log(`});`);
  } else {
    console.log(`❌ None of the endpoints worked. Troubleshooting steps:`);
    console.log(`\n🔧 TROUBLESHOOTING:`);
    console.log(`1. Start Chrome with remote debugging:`);
    console.log(`   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`);
    console.log(`\n2. Or start Chrome in headless mode:`);
    console.log(`   chrome --headless --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`);
    console.log(`\n3. Verify Chrome DevTools is accessible:`);
    console.log(`   Open http://localhost:9222 in your browser`);
    console.log(`\n4. If using Docker/containers, ensure port 9222 is exposed`);
    console.log(`\n5. Check if Chrome is already running without remote debugging`);
    console.log(`   Kill all Chrome processes and restart with the --remote-debugging-port flag`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
