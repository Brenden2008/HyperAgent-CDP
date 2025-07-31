# CDP Browser Provider Examples

This directory contains examples for using HyperAgent with the Chrome DevTools Protocol (CDP) browser provider. CDP allows you to connect to an existing Chrome/Chromium browser instance instead of launching a new one.

## Overview

The CDP browser provider is useful when:
- You want to use an existing Chrome browser session
- You're running in a containerized environment
- You need to connect to a remote Chrome instance
- You want more control over the browser startup process

## Prerequisites

### Required
- Node.js environment
- OpenAI API key set in environment: `export OPENAI_API_KEY=your_api_key_here`

### Chrome/Chromium Options

You have several options for running Chrome with CDP:

#### Option 1: Local Chrome Installation
```bash
# Start Chrome with remote debugging
chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0

# Or in headless mode
chrome --headless --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
```

#### Option 2: Docker (Recommended if Chrome not installed)
```bash
# Start Chrome in Docker container
docker run -d --rm --name chrome-cdp -p 9222:9222 \
  zenika/alpine-chrome:latest \
  --no-sandbox --remote-debugging-address=0.0.0.0 \
  --remote-debugging-port=9222 --disable-gpu --disable-dev-shm-usage

# Stop when done
docker stop chrome-cdp
```

#### Option 3: Using Playwright's Browser
```bash
# If you have Playwright installed, you can use its bundled Chromium
npx playwright install chromium
# Then start it manually with CDP enabled (see Playwright docs)
```

## Examples

### 1. `test-cdp-connection.ts` - Connection Tester
Tests various CDP endpoints to find the correct configuration for your setup.

```bash
npx tsx examples/browser-providers/test-cdp-connection.ts
```

This script will:
- Check if Chrome DevTools is accessible via HTTP
- Test multiple WebSocket endpoints
- Provide detailed troubleshooting information

### 2. `simple-cdp.ts` - Basic Usage
Simple example showing basic CDP connection and page navigation.

```bash
npx tsx examples/browser-providers/simple-cdp.ts
```

Features:
- Connects to CDP browser
- Navigates to a webpage
- Takes a screenshot
- Demonstrates basic page operations

### 3. `cdp.ts` - Standard Example
More comprehensive example with proper error handling and documentation.

```bash
npx tsx examples/browser-providers/cdp.ts
```

Features:
- Detailed setup instructions
- Comprehensive error handling
- Multiple troubleshooting suggestions

### 4. `cdp-hyperagent.ts` - AI Automation
Shows how to use AI-powered web automation with CDP.

```bash
npx tsx examples/browser-providers/cdp-hyperagent.ts
```

Features:
- AI-powered web tasks
- Google search automation
- Result extraction using LLM

### 5. `cdp-docker.ts` - Docker Integration
Automated Docker Chrome setup and usage.

```bash
npx tsx examples/browser-providers/cdp-docker.ts
```

Features:
- Automatic Docker container management
- Chrome container health checking
- Complete setup automation

## Common Issues and Solutions

### Issue: "Failed to connect to CDP WebSocket endpoint"

**Solutions:**
1. **Check Chrome is running:**
   ```bash
   curl http://localhost:9222/json/version
   ```

2. **Verify the correct endpoint:**
   - Try `ws://localhost:9222/devtools/browser`
   - Or `ws://localhost:9222`
   - Check available endpoints at `http://localhost:9222/json`

3. **Check Chrome startup flags:**
   ```bash
   chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
   ```

4. **Use Docker if Chrome isn't installed:**
   ```bash
   docker run -d --rm --name chrome-cdp -p 9222:9222 \
     zenika/alpine-chrome:latest \
     --no-sandbox --remote-debugging-address=0.0.0.0 \
     --remote-debugging-port=9222 --disable-gpu
   ```

### Issue: "No LLM provider provided"

**Solution:**
Set your OpenAI API key:
```bash
export OPENAI_API_KEY=your_api_key_here
```

### Issue: Chrome won't start in headless mode

**Solutions:**
1. **Add additional flags:**
   ```bash
   chrome --headless --no-sandbox --disable-gpu --disable-dev-shm-usage \
     --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0
   ```

2. **Use Docker instead:**
   Docker handles all the complexity for you.

## Configuration Options

### Basic Configuration
```typescript
const agent = new HyperAgent({
  llm: new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
  browserProvider: "CDP",
  cdpConfig: {
    wsEndpoint: "ws://localhost:9222/devtools/browser",
    options: {
      timeout: 30000,
    }
  },
  debug: true,
});
```

### Advanced Configuration
```typescript
const agent = new HyperAgent({
  llm: llm,
  browserProvider: "CDP",
  cdpConfig: {
    wsEndpoint: "ws://remote-chrome:9222/devtools/browser",
    options: {
      timeout: 60000,
      slowMo: 100, // Slow down operations
    }
  },
  debug: true,
});
```

## WebSocket Endpoints

Different Chrome setups may expose different WebSocket endpoints:

- `ws://localhost:9222/devtools/browser` - Most common
- `ws://localhost:9222` - Alternative format
- `ws://127.0.0.1:9222/devtools/browser` - IPv4 explicit
- `ws://127.0.0.1:9222` - IPv4 alternative

Use the connection tester to find the right one for your setup.

## Port Configuration

If port 9222 is busy, you can use a different port:

```bash
# Start Chrome on port 9223
chrome --remote-debugging-port=9223 --remote-debugging-address=0.0.0.0

# Update your configuration
wsEndpoint: "ws://localhost:9223/devtools/browser"
```

## Security Notes

- `--remote-debugging-address=0.0.0.0` makes Chrome accessible from any network interface
- For production, use `--remote-debugging-address=127.0.0.1` to restrict to localhost
- Consider firewall rules when exposing remote debugging ports
- Never expose CDP ports to the internet without proper authentication

## Troubleshooting

1. **Run the connection tester first:**
   ```bash
   npx tsx examples/browser-providers/test-cdp-connection.ts
   ```

2. **Check Chrome DevTools is accessible:**
   ```bash
   curl http://localhost:9222/json/version
   ```

3. **Verify WebSocket endpoints:**
   ```bash
   curl http://localhost:9222/json
   ```

4. **Check Chrome process:**
   ```bash
   ps aux | grep chrome
   ```

5. **Try Docker approach:**
   ```bash
   npx tsx examples/browser-providers/cdp-docker.ts
   ```

## Need Help?

If you're still having issues:

1. Run the connection tester for automatic diagnosis
2. Check that your OpenAI API key is set
3. Try the Docker example for a clean environment
4. Verify Chrome is accessible at `http://localhost:9222`

The examples include comprehensive error messages and troubleshooting steps to help you get up and running quickly.
