<div align="center">
  <img src="assets/hyperagent-banner.png" alt="Hyperagent Banner" width="800"/>

  <p align="center">
    <strong>Intelligent Browser Automation with LLMs</strong>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/@hyperbrowser/agent">
      <img src="https://img.shields.io/npm/v/@hyperbrowser/agent" alt="npm version" />
    </a>
    <a href="https://github.com/hyperbrowserai/hyperagent/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/@hyperbrowser/agent" alt="license" />
    </a>
    <a href="https://github.com/hyperbrowserai/hyperagent/stargazers">
      <img src="https://img.shields.io/github/stars/yourusername/hyperagent" alt="GitHub stars" />
    </a>
  </p>
</div>

## Overview

Hyperagent is a powerful browser automation framework that combines the precision of Playwright with the intelligence of Large Language Models (LLMs). It enables developers to create sophisticated web automation scripts that can understand context, adapt to changes, and handle complex interactions just like a human would.

### Key Features

- 🧠 **AI-Powered Navigation**: Intelligent web navigation using state-of-the-art LLMs
- 🎯 **Smart Interactions**: Context-aware element interaction and form filling
- 📊 **Structured Data Extraction**: Extract data in your preferred schema
- ⚡ **Async Task Management**: Start, pause, resume, and cancel tasks at will
- 🔄 **Flexible LLM Support**: Works with OpenAI's GPT-4 and other LLM providers
- 🛠️ **Extensible Architecture**: Add custom actions and behaviors

## Quick Start

### Installation

```bash
# Using npm
npm install @hyperbrowser/agent

# Using yarn
yarn add @hyperbrowser/agent
```

### Basic Usage

```typescript
import { HyperAgent } from "@hyperbrowser/agent";
import { ChatOpenAI } from "@langchain/openai";

// Initialize the agent
const agent = new HyperAgent({
  llm: new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
  }),
});

// Execute a task
const result = await agent.executeTask(
  "Navigate to amazon.com, search for 'laptop', and extract the prices of the first 5 results"
);

console.log(result.output);

// Clean up
await agent.closeAgent();
```

## Usage Guide

### Task Execution Modes

Hyperagent supports both synchronous and asynchronous task execution:

```typescript
// Synchronous execution
const result = await agent.executeTask("Extract data from the current page");

// Asynchronous execution with control
const task = await agent.executeTaskAsync("Long running scraping task");
await task.pause(); // Pause the task
await task.resume(); // Resume the task
await task.cancel(); // Cancel the task
```

### Multi-Page Management

```typescript
// Create and manage multiple pages
const page1 = await agent.newPage();
const page2 = await agent.newPage();

// Execute tasks on specific pages
await page1.ai("Navigate to google.com");
await page2.ai("Navigate to github.com");

// Get all active pages
const pages = await agent.getPages();
```

## Customization

### Output Schema Definition

Define structured output formats for your tasks:

```typescript
const agent = new HyperAgent({
  outputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      price: { type: "number" },
      availability: { type: "boolean" },
    },
    required: ["title", "price"],
  },
});
```

### Using Different LLM Providers

Hyperagent supports various LLM providers:

```typescript
// Using OpenAI
const agent = new HyperAgent({
  llm: new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4",
  }),
});

// Using Anthropic's Claude
const agent = new HyperAgent({
  llm: new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: "claude-2",
  }),
});
```

### Custom Actions

Extend Hyperagent's capabilities with custom actions:

```typescript
const customAction = {
  type: "CUSTOM_ACTION",
  description: "Performs a custom operation",
  parameters: {
    param1: { type: "string" },
    param2: { type: "number" },
  },
  execute: async (params) => {
    // Custom implementation
  },
};

const agent = new HyperAgent({
  customActions: [customAction],
});
```

## Contributing

We welcome contributions to Hyperagent! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.hyperbrowser.ai/hyperagent/about-hyperagent)
- 💬 [Discord Community](https://discord.gg/zsYzsgVRjh)
- 🐛 [Issue Tracker](https://github.com/hyperbrowserai/HyperAgent/issues)
- 📧 [Email Support](mailto:info@hyperbrowser.ai)
