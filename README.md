# Respondo CRM

**Respondo** is an AI-ready CRM platform designed for local businesses to centralize customer communications, structure them into actionable tickets, and generate AI-assisted responses with a human-in-the-loop approval workflow.

> **Status:** MVP foundation complete. Email ingestion, ticketing, RAG-based FAQs, and AI summarization are implemented. Multi-channel support and deeper AI workflows are planned.

---

## The Problem

Local businesses receive customer queries across fragmented channels (email, websites, messaging apps). These messages are:

- Unstructured and context-poor
- Manually handled with no memory or intelligence
- Difficult to scale without operational cost

Traditional CRMs store data. **Respondo prepares data for reasoning.**

---

## What Respondo Does

Respondo acts as a **single system of record** for customer interactions and an **AI orchestration layer** on top of them.

At a high level, Respondo:

- Ingests customer messages
- Structures them into tickets
- Enriches them with business and customer context
- Uses RAG + LLMs to assist response generation
- Keeps humans in control of final communication

---

## Core Features (Implemented)

### 1. Message Ingestion (Email-first)

- Ingests customer emails via **Nylas**
- Normalizes messages into internal records
- Designed to support additional channels (API, WhatsApp, chat)

### 2. Ticketing System

- Each incoming message becomes a **ticket**
- Tickets represent discrete customer issues
- Lifecycle handled via secure server actions

### 3. RAG-Based Knowledge Retrieval (FAQs)

- Implemented **Retrieval-Augmented Generation (RAG)** for FAQs
- Uses vector embeddings to fetch relevant knowledge
- Currently scoped to FAQs, architected to extend to full conversation history

### 4. AI Summarization & Draft Responses

- Uses **Google Gemini API** for:

  - Message summarization
  - Auto-generated draft replies

- Responses are generated as **assistive suggestions**, not auto-sent messages

### 5. Business & Customer Profiles

- Business profiles define operational context for AI
- Planned **deep customer profiles** to capture:

  - Past interactions
  - Preferences
  - Behavioral signals

- Designed to improve response quality over time

### 6. Background Processing

- Uses **QStash** for background jobs
- Handles asynchronous workflows such as:

  - Message processing
  - Embedding generation
  - AI calls

- Keeps request-response paths fast and reliable

### 7. Secure Server-Side Architecture

- Built with **Next.js Server Actions**
- All mutations are server-controlled
- No sensitive logic exposed to the client

---

## AI & Data Pipeline (Current)

```
Customer Email
      ↓
Nylas Ingestion
      ↓
Server Action
      ↓
Ticket Creation
      ↓
Embedding (Upstash Vector)
      ↓
RAG (FAQs)
      ↓
Gemini Summarization / Draft Reply
      ↓
Operator Review (UI)
```

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI & Theming:** Material UI (MUI)
- **Backend Pattern:** Server Actions
- **Database:** MongoDB
- **Email Ingestion:** Nylas
- **LLM Provider:** Google Gemini API
- **Vector Store:** Upstash Vector
- **Background Jobs:** QStash
- **Auth Strategy:** JWT-based (prepared)
- **Styling:** Tailwind (utility-level)
- **Deployment Target:** Vercel-compatible

---

## Project Structure (Key Areas)

```
src/
├── actions/
│   ├── ingestion.ts      # Message ingestion & normalization
│   ├── ticketActions.ts  # Ticket lifecycle logic
│   ├── profileActions.ts # Business & customer profiles
│   └── user.ts           # User operations
├── app/
│   ├── layout.tsx        # Global layout & theme
│   └── page.tsx          # Entry point
├── proxy.ts              # External integrations & workers
```

---

## Channels: Current & Planned

**Implemented**

- Email (via Nylas)

**Planned**

- API-based ingestion (direct business integration)
- WhatsApp
- Web chat / widgets

The ingestion layer is intentionally channel-agnostic.

---

## Design Principles

- **AI assists humans, not replaces them**
- **Human-in-the-loop by default**
- **Pipeline-driven, not UI-driven**
- **Async-first architecture**
- **Extensible without rewrites**

---

## Current Limitations (Intentional)

- RAG currently scoped to FAQs only
- No real-time chat UI
- No role-based UI separation yet
- AI suggestions require manual approval

These are conscious MVP trade-offs to prioritize correctness and architecture.

---

## Why This Project Matters

Respondo demonstrates:

- Real-world AI integration (RAG + LLMs)
- Async background processing at scale
- Clean SaaS architecture decisions
- Practical AI safety via human approval loops

This project is suitable for:

- Strong internship applications
- Full-stack / backend interviews
- AI-enabled SaaS discussions
- Startup engineering evaluation

---

## Roadmap (High Level)

- Extend RAG to full conversation history
- Introduce detailed customer intelligence profiles
- Add operator dashboard with role-based access
- Enable API and WhatsApp ingestion
- Ship analytics and audit logs
