#!/usr/bin/env npx tsx

/**
 * Quick CDP Test - No API Key Required
 * 
 * This is a minimal test to verify CDP connectivity without requiring an OpenAI API key.
 * It only tests the browser connection, not AI functionality.
 */

import { chromium } from "playwright";

async function testCDPConnectivity() {
  console.log("🔍 Testing CDP connectivity without HyperAgent...\n");
  
  const endpoints = [
    "ws://localhost:9222/devtools/browser",
    "ws://localhost:9222",
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    
    try {
      const browser = await chromium.connectOverCDP({
        endpointURL: endpoint,
        timeout: 5000,
      });
      
      console.log(`✅ SUCCESS: Connected to ${endpoint}`);
      
      // Test basic functionality
      const contexts = browser.contexts();
      console.log(`   Found ${contexts.length} browser context(s)`);
      
      if (contexts.length === 0) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto("data:text/html,<h1>CDP Test</h1>");
        const title = await page.title();
        console.log(`   Page title: "${title}"`);
        await context.close();
      } else {
        console.log(`   Using existing context`);
      }
      
      await browser.close();
      console.log(`   Connection closed cleanly\n`);
      return endpoint;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ FAILED: ${errorMessage}\n`);
    }
  }
  
  return null;
}

async function main() {
  console.log("🚀 Quick CDP Connection Test\n");
  
  // First check if Chrome DevTools is accessible
  try {
    const response = await fetch("http://localhost:9222/json/version");
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Chrome DevTools detected:`);
      console.log(`   Browser: ${data.Browser}`);
      console.log(`   WebSocket URL: ${data.webSocketDebuggerUrl}\n`);
    }
  } catch (error) {
    console.log(`❌ Chrome DevTools not accessible at http://localhost:9222\n`);
  }
  
  const workingEndpoint = await testCDPConnectivity();
  
  if (workingEndpoint) {
    console.log(`🎉 SUCCESS! CDP is working with endpoint: ${workingEndpoint}`);
    console.log(`\n📝 You can now use this in your HyperAgent configuration:`);
    console.log(`\nconst agent = new HyperAgent({`);
    console.log(`  llm: new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" }),`);
    console.log(`  browserProvider: "CDP",`);
    console.log(`  cdpConfig: {`);
    console.log(`    wsEndpoint: "${workingEndpoint}",`);
    console.log(`    options: { timeout: 30000 }`);
    console.log(`  },`);
    console.log(`  debug: true`);
    console.log(`});`);
  } else {
    console.log(`❌ No working CDP endpoints found.`);
    console.log(`\n🔧 To start Chrome with CDP support:`);
    console.log(`\n1. Local Chrome:`);
    console.log(`   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`);
    console.log(`\n2. Docker (recommended):`);
    console.log(`   docker run -d --rm --name chrome-cdp -p 9222:9222 \\`);
    console.log(`     zenika/alpine-chrome:latest \\`);
    console.log(`     --no-sandbox --remote-debugging-address=0.0.0.0 \\`);
    console.log(`     --remote-debugging-port=9222 --disable-gpu`);
    console.log(`\n3. Then re-run this test to verify connectivity`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
