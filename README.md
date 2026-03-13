# 🚀 Shopify AI-Powered Commerce Assistant

### Intelligent Revenue Optimization Layer for Shopify

An enterprise-ready AI assistant that analyzes Shopify order data and
converts it into actionable business recommendations using **LLMs +
semantic search (RAG)**.

------------------------------------------------------------------------

## 🧠 What This App Does

-   Analyzes Shopify order data
-   Identifies revenue trends
-   Detects bundle opportunities
-   Recommends discount strategies
-   Flags churn and return risks
-   Generates AI-driven business insights

Unlike traditional dashboards, this assistant explains: - Why
performance changed - What to do next - How to measure impact

------------------------------------------------------------------------

## 🏗 Architecture Overview

Shopify Admin API / Webhooks\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Data Normalization Layer\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
SQLite (Order Storage)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Embedding Model (Ollama)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Semantic Search (Cosine Similarity)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
LLM Reasoning Layer\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
React Admin UI

------------------------------------------------------------------------

## 🛠 Tech Stack

**Backend** - Node.js + Express - SQLite - Zod validation

**AI Layer** - Ollama (llama3) - nomic-embed-text (embeddings)

**Frontend** - React + Vite

------------------------------------------------------------------------

## 📦 Project Structure

ai-commerce-assistant/<br> 
&nbsp;|<br>
&nbsp;|── backend/<br>
&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── src/<br>
&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── package.json<br> 
&nbsp;|<br>
&nbsp;|── frontend/<br>
&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── src/<br>
&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── package.json<br>
&nbsp;|<br>
└── README.md

------------------------------------------------------------------------

## 🛠 Local Setup

### 1. Install Node.js (v18+)

### 2. Install Ollama

Pull required models:

    ollama pull llama3
    ollama pull nomic-embed-text

### 3. Start Backend

    cd backend
    npm install
    npm run dev

Backend runs at: http://localhost:8787

### 4. Start Frontend

    cd frontend
    npm install
    npm run dev

Open the URL shown in terminal (usually http://localhost:5173)

------------------------------------------------------------------------

## 🧪 Demo Usage

1.  Ingest sample orders
2.  Ask questions like:
    -   "Suggest bundle offers"
    -   "What discount strategy should we run?"
    -   "Which products show return risk?"
3.  Review AI-generated recommendations

------------------------------------------------------------------------

## 🔐 Enterprise Roadmap

-   OAuth install flow
-   Webhook verification (HMAC)
-   Multi-tenant architecture
-   Vector database integration
-   Observability & logging
-   AWS deployment
