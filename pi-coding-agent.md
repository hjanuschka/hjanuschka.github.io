---
title: "Why I Switched to Pi: A Terminal-First Coding Agent"
category: "Tools"
tech: "TypeScript / AI"
---

*From Claude Code to Pi - why a shitty coding agent became my daily driver*

## The Discovery

A few weeks ago, I stumbled upon [Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) by Mario Zechner ([@badlogic](https://github.com/badlogic)) - yes, the same Mario behind [libGDX](https://libgdx.com/), the cross-platform game framework. He's been building a terminal-based coding agent that's refreshingly different from the mainstream options.

The project doesn't take itself too seriously - its website is literally [shittycodingagent.ai](https://shittycodingagent.ai) - but under the hood, it's become one of the most capable and extensible coding agents I've used.

## Why Pi?

### Multi-Model Freedom

The killer feature that first caught my attention: **mid-session model switching**. I can start a conversation with Claude Opus for exploration, switch to GPT-5.2 for a second opinion, then jump to Gemini for its massive context window - all in the same session.

```bash
# Press Ctrl+L to open model selector anytime
# Or use Ctrl+P to cycle through models
```

Pi supports basically every provider:
- Anthropic (API + Claude Pro/Max via OAuth)
- OpenAI
- Google Gemini (free tier via OAuth!)
- GitHub Copilot (if you have the subscription)
- Mistral, Groq, xAI, OpenRouter, and more

### The Session Tree

Instead of linear chat history, Pi stores sessions as **trees**. Every conversation branch is preserved. Made a mistake 10 messages ago? Use `/tree` to navigate back, branch off, and try a different approach - without losing your original path.

This has saved me countless times when exploring different solutions to a problem.

### Skills System

Pi implements the [Agent Skills](https://agentskills.io/specification) standard - self-contained capability packages the agent loads on-demand. Think of them as specialized "modes" - a skill might contain setup instructions, helper scripts, and workflow documentation for a specific task like browser automation, API integrations, or code review workflows.

The agent automatically detects when a skill is relevant based on its description. No manual activation needed.

### Extensibility Done Right

The hook system is where Pi really shines. Want to customize behavior? Write a TypeScript hook:

```typescript
// hooks/my-hook.ts
export default {
  name: "my-hook",
  before_agent_start: async (ctx) => {
    // Modify prompts, inject context, whatever you need
    return { systemPromptAppend: "Always be concise." };
  }
};
```

I've published my own hooks at [shitty-extensions](https://github.com/hjanuschka/shitty-extensions):

- **memory-mode** - Save instructions to AGENTS.md with AI-assisted integration
- **plan-mode** - Claude Code-style read-only exploration mode
- **usage-bar** - Track AI provider usage statistics

## My Contributions

- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add plan mode for safe code analysis**](https://github.com/badlogic/pi-mono/pull/416) - Claude Code-style read-only exploration mode
- <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">MERGED</span> [**Add configurable keybindings system**](https://github.com/badlogic/pi-mono/pull/405) - Customize all keyboard shortcuts via `~/.pi/agent/keybindings.json`

## Getting Started

```bash
npm install -g @mariozechner/pi-coding-agent
pi
```

## Contributing Back

Speaking of contributions - the project is actively developed and welcoming to PRs. The codebase is clean TypeScript, well-documented, and Mario is responsive to issues and pull requests.

My keybindings PR went from idea to merged in a few days. That's the kind of open source experience I appreciate.

## The Philosophy

From Pi's README:

> Pi is a terminal-native coding agent designed for developers who prefer keyboard-driven workflows. It emphasizes transparency, control, and extensibility over magic.

That resonates with me. I want to see what the agent is doing, control its behavior, and extend it when needed. Pi delivers on all three.

## Try It

```bash
npm install -g @mariozechner/pi-coding-agent
export ANTHROPIC_API_KEY=sk-ant-...
pi
```

Or grab a [standalone binary](https://github.com/badlogic/pi-mono/releases) if you don't want Node.js.

The [Discord community](https://discord.com/invite/nKXTsAcmbT) is active and helpful. And yes, the website is still [shittycodingagent.ai](https://shittycodingagent.ai) - embrace it.

---

**Links:**
- [GitHub Repository](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [NPM Package](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Discord Community](https://discord.com/invite/nKXTsAcmbT)
- [Agent Skills Specification](https://agentskills.io/specification)
