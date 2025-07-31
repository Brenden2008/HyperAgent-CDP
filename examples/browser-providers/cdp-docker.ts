#!/usr/bin/env npx tsx

/**
 * # CDP with Docker Chrome Example
 * 
 * This example shows how to use HyperAgent with CDP when Chrome isn't installed locally.
 * It provides instructions and scripts for running Chrome in Docker.
 * 
 * ## Prerequisites
 * 
 * 1. Docker installed and running
 * 2. OpenAI API key set in environment (OPENAI_API_KEY)
 * 
 * ## Running Chrome in Docker
 * 
 * Before running this script, start Chrome in Docker:
 * 
 * ```bash
 * docker run -d --rm --name chrome-cdp -p 9222:9222 \
 *   zenika/alpine-chrome:latest \
 *   --no-sandbox --remote-debugging-address=0.0.0.0 \
 *   --remote-debugging-port=9222 --disable-gpu --disable-dev-shm-usage
 * ```
 * 
 * Then run this example:
 * 
 * ```bash
 * npx tsx examples/browser-providers/cdp-docker.ts
 * ```
 * 
 * To stop the Docker container when done:
 * 
 * ```bash
 * docker stop chrome-cdp
 * ```
 */

import "dotenv/config";
import { HyperAgent } from "../../src";
import { ChatOpenAI } from "@langchain/openai";
import { execSync } from "child_process";

async function checkDockerChrome() {
  try {
    const result = execSync("docker ps --filter name=chrome-cdp --format '{{.Names}}'", { encoding: 'utf8' });
    return result.trim() === 'chrome-cdp';
  } catch {
    return false;
  }
}

async function startDockerChrome() {
  console.log("🐳 Starting Chrome in Docker...");
  try {
    execSync(`docker run -d --rm --name chrome-cdp -p 9222:9222 \
      zenika/alpine-chrome:latest \
      --no-sandbox --remote-debugging-address=0.0.0.0 \
      --remote-debugging-port=9222 --disable-gpu --disable-dev-shm-usage`, 
      { stdio: 'inherit' });
    
    // Wait a bit for Chrome to start
    console.log("⏳ Waiting for Chrome to start...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    return true;
  } catch (error) {
    console.error("❌ Failed to start Chrome in Docker:", error);
    return false;
  }
}

async function main() {
  console.log("🐳 CDP with Docker Chrome Example\n");
  
  // Check if we have an OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable is required");
    console.error("   Please set your OpenAI API key in the environment");
    process.exit(1);
  }

  // Check if Docker Chrome is running
  const chromeRunning = await checkDockerChrome();
  if (!chromeRunning) {
    console.log("📋 Chrome container not found. Let me start it for you...");
    const started = await startDockerChrome();
    if (!started) {
      console.error("\n❌ Failed to start Chrome in Docker. Please run manually:");
      console.error("docker run -d --rm --name chrome-cdp -p 9222:9222 \\");
      console.error("  zenika/alpine-chrome:latest \\");
      console.error("  --no-sandbox --remote-debugging-address=0.0.0.0 \\");
      console.error("  --remote-debugging-port=9222 --disable-gpu --disable-dev-shm-usage");
      process.exit(1);
    }
  } else {
    console.log("✅ Chrome container is already running");
  }

  try {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0,
    });

    console.log("🤖 Creating HyperAgent with Docker Chrome...");
    const agent = new HyperAgent({
      llm: llm,
      browserProvider: "CDP",
      cdpConfig: {
        wsEndpoint: "ws://localhost:9222/devtools/browser",
        options: {
          timeout: 15000, // Longer timeout for Docker
        }
      },
      debug: true,
    });

    console.log("📡 Connecting to Docker Chrome...");
    const page = await agent.getCurrentPage();
    
    console.log("✅ Connected successfully!");
    console.log("🌐 Running a simple automation task...");
    
    // Execute a simple AI task
    const response = await agent.executeTask(
      "Navigate to https://httpbin.org/get and extract the 'origin' IP address from the JSON response"
    );

    console.log("\n🎉 Task completed!");
    console.log("📋 Response:", response.output);
    
    // Clean up
    await agent.closeAgent();
    console.log("🧹 Agent closed.");
    
    // Optionally stop the Docker container
    console.log("\n🐳 Docker container is still running. To stop it, run:");
    console.log("   docker stop chrome-cdp");
    
  } catch (error) {
    console.error("❌ Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        console.error("\n🔧 Connection failed. Checking Docker container...");
        const isRunning = await checkDockerChrome();
        if (!isRunning) {
          console.error("   Docker container 'chrome-cdp' is not running");
          console.error("   Please start it with the command shown above");
        } else {
          console.error("   Container is running but connection failed");
          console.error("   Try waiting a bit longer or check container logs:");
          console.error("   docker logs chrome-cdp");
        }
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}
