<div align="center">

# Kortix – Open Source Platform to Build, Manage and Train AI Agents

![Kortix Screenshot](frontend/public/banner.png)

**The complete platform for creating autonomous AI agents that work for you**

Kortix is a comprehensive open source platform that empowers you to build, manage, and train sophisticated AI agents for any use case. Create powerful agents that act autonomously on your behalf, from general-purpose assistants to specialized automation tools.

[![License](https://img.shields.io/badge/License-Apache--2.0-blue)](./license)
[![Discord Follow](https://dcbadge.limes.pink/api/server/Py6pCBUUPw?style=flat)](https://discord.gg/Py6pCBUUPw)
[![Twitter Follow](https://img.shields.io/twitter/follow/kortixai)](https://x.com/kortixai)
[![GitHub Repo stars](https://img.shields.io/github/stars/kortix-ai/suna)](https://github.com/kortix-ai/suna)
[![Issues](https://img.shields.io/github/issues/kortix-ai/suna)](https://github.com/kortix-ai/suna/labels/bug)

<!-- Keep these links. Translations will automatically update with the README. -->
[Deutsch](https://www.readme-i18n.com/kortix-ai/suna?lang=de) | 
[Español](https://www.readme-i18n.com/kortix-ai/suna?lang=es) | 
[français](https://www.readme-i18n.com/kortix-ai/suna?lang=fr) | 
[日本語](https://www.readme-i18n.com/kortix-ai/suna?lang=ja) | 
[한국어](https://www.readme-i18n.com/kortix-ai/suna?lang=ko) | 
[Português](https://www.readme-i18n.com/kortix-ai/suna?lang=pt) | 
[Русский](https://www.readme-i18n.com/kortix-ai/suna?lang=ru) | 
[中文](https://www.readme-i18n.com/kortix-ai/suna?lang=zh)

</div>

## 🌟 What Makes Kortix Special

### 🤖 Includes Suna – Flagship Generalist AI Worker
Meet Suna, our showcase agent that demonstrates the full power of the Kortix platform. Through natural conversation, Suna handles research, data analysis, browser automation, file management, and complex workflows – showing you what's possible when you build with Kortix.

### 🔧 Build Custom Suna-Type Agents
Create your own specialized agents tailored to specific domains, workflows, or business needs. Whether you need agents for customer service, data processing, content creation, or industry-specific tasks, Kortix provides the infrastructure and tools to build, deploy, and scale them.

### 🚀 Complete Platform Capabilities
- **Browser Automation**: Navigate websites, extract data, fill forms, automate web workflows
- **File Management**: Create, edit, and organize documents, spreadsheets, presentations, code
- **Web Intelligence**: Crawling, search capabilities, data extraction and synthesis
- **System Operations**: Command-line execution, system administration, DevOps tasks
- **API Integrations**: Connect with external services and automate cross-platform workflows
- **Agent Builder**: Visual tools to configure, customize, and deploy agents

## 📋 Table of Contents

- [🌟 What Makes Kortix Special](#-what-makes-kortix-special)
- [🎯 Agent Examples & Use Cases](#-agent-examples--use-cases)
- [🏗️ Platform Architecture](#️-platform-architecture)
- [🚀 Quick Start](#-quick-start)
- [🏠 Self-Hosting](#-self-hosting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Agent Examples & Use Cases

### Suna - Your Generalist AI Worker

Suna demonstrates the full capabilities of the Kortix platform as a versatile AI worker that can:

**🔍 Research & Analysis**
- Conduct comprehensive web research across multiple sources
- Analyze documents, reports, and datasets
- Synthesize information and create detailed summaries
- Market research and competitive intelligence

**🌐 Browser Automation**
- Navigate complex websites and web applications
- Extract data from multiple pages automatically
- Fill forms and submit information
- Automate repetitive web-based workflows

**📁 File & Document Management**
- Create and edit documents, spreadsheets, presentations
- Organize and structure file systems
- Convert between different file formats
- Generate reports and documentation

**📊 Data Processing & Analysis**
- Clean and transform datasets from various sources
- Perform statistical analysis and create visualizations
- Monitor KPIs and generate insights
- Integrate data from multiple APIs and databases

**⚙️ System Administration**
- Execute command-line operations safely
- Manage system configurations and deployments
- Automate DevOps workflows
- Monitor system health and performance

### Build Your Own Specialized Agents

The Kortix platform enables you to create agents tailored to specific needs:

**🎧 Customer Service Agents**
- Handle support tickets and FAQ responses
- Manage user onboarding and training
- Escalate complex issues to human agents
- Track customer satisfaction and feedback

**✍️ Content Creation Agents**
- Generate marketing copy and social media posts
- Create technical documentation and tutorials
- Develop educational content and training materials
- Maintain content calendars and publishing schedules

**📈 Sales & Marketing Agents**
- Qualify leads and manage CRM systems
- Schedule meetings and follow up with prospects
- Create personalized outreach campaigns
- Generate sales reports and forecasts

**🔬 Research & Development Agents**
- Conduct academic and scientific research
- Monitor industry trends and innovations
- Analyze patents and competitive landscapes
- Generate research reports and recommendations

**🏭 Industry-Specific Agents**
- Healthcare: Patient data analysis, appointment scheduling
- Finance: Risk assessment, compliance monitoring
- Legal: Document review, case research
- Education: Curriculum development, student assessment

Each agent can be configured with custom tools, workflows, knowledge bases, and integrations specific to your requirements.

## 🏗️ Platform Architecture

![Architecture Diagram](docs/images/diagram.png)

Kortix consists of four main components that work together to provide a complete AI agent development platform:

### 🔧 Backend API
Python/FastAPI service that powers the agent platform with REST endpoints, thread management, agent orchestration, and LLM integration with Anthropic, OpenAI, and others via LiteLLM. Includes agent builder tools, workflow management, and extensible tool system.

### 🖥️ Frontend Dashboard
Next.js/React application providing a comprehensive agent management interface with chat interfaces, agent configuration dashboards, workflow builders, monitoring tools, and deployment controls.

### 🐳 Agent Runtime
Isolated Docker execution environments for each agent instance featuring browser automation, code interpreter, file system access, tool integration, security sandboxing, and scalable agent deployment.

### 🗄️ Database & Storage
Supabase-powered data layer handling authentication, user management, agent configurations, conversation history, file storage, workflow state, analytics, and real-time subscriptions for live agent monitoring.

## 🚀 Quick Start

Get Suna running in **under 5 minutes**!

### Desktop Application (Windows)

Want to use Suna as a native Windows desktop app?

🖥️ **[Download Suna Desktop](https://github.com/kortix-ai/suna/releases)** - Native Windows application with OAuth support

📖 **[Desktop App Setup Guide →](./ELECTRON.md)** - Complete guide for building and distributing

### Option 1: Web App - Quick Start (Minimal Setup - Recommended)

For fastest setup with just the essentials:

```bash
git clone https://github.com/kortix-ai/suna.git
cd suna
```

**You only need:**
- Supabase (free local or cloud)
- One LLM API key (Anthropic, OpenAI, Groq, etc.)

📖 **[Follow the Quick Start Guide →](./QUICKSTART.md)**

This gets you up and running with core agent functionality. Optional features (web search, sandboxes, etc.) can be added later.

### Option 2: Full Setup Wizard

For a complete setup with all features:

```bash
python setup.py  # Interactive wizard with 17 steps
python start.py  # Start all services
```

The wizard guides you through configuring all available integrations with progress saving.

## 🏠 Self-Hosting

- **Quick & Easy:** [Quick Start Guide](./QUICKSTART.md) - 5 minutes to get running
- **Full Featured:** Run `python setup.py` for interactive setup with all services
- **Understanding Services:** [API Keys & Feature Guide](./docs/API_KEYS_GUIDE.md) - Learn what each service enables

### What You'll Need

**Minimum (5 min setup):**
- Supabase (free local or cloud)
- One LLM API key (many have free tiers)

**Optional (adds features):**
- Web search, scraping, sandboxes, and more
- See [API Keys Guide](./docs/API_KEYS_GUIDE.md) for details

---

<div align="center">

**Ready to build your first AI agent?** 

[Quick Start](./QUICKSTART.md) • [API Keys Guide](./docs/API_KEYS_GUIDE.md) • [Join Discord](https://discord.gg/Py6pCBUUPw) • [Follow on Twitter](https://x.com/kortix)

</div>
