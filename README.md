<div align="center">
  <img src="public/favicon.ico" alt="StoryForge AI Logo" width="100" />
  <h1>StoryForge AI</h1>
  <p><strong>The Ultimate AI-Powered Storytelling & World-Building Platform</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/Vite-5.0-purple?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

<hr />

## 🌟 Overview

**StoryForge AI** is a premium, full-stack storytelling SaaS platform designed for authors, dungeon masters, and creatives. Built with modern web technologies, it harnesses the power of AI to generate deeply immersive stories, dynamic characters, rich worlds, and even fully synthesized audiobooks. 

Say goodbye to writer's block. Whether you're crafting a quick sci-fi short or an epic fantasy saga, StoryForge AI maintains your **Story Bible**, tracking characters, rules, and pacing to generate novelist-grade prose that feels incredibly human.

## ✨ Key Features

- 📖 **Stateful Story Generation:** Generates multi-chapter stories while seamlessly tracking the timeline, world rules, and character traits using a living "Story Bible".
- 🎙️ **AI Audiobooks:** Transforms your generated chapters into professional, expressive audiobooks using **ElevenLabs** Text-to-Speech (TTS). Supports multiple narrator styles (Dramatic, Warm, Journalistic, Whimsical, Dark).
- 🌍 **World Builder & Characters:** Procedurally generate detailed worlds, factions, and deep character profiles.
- 🎨 **Beautiful & Modern UI:** A stunning, highly responsive interface built with `shadcn/ui`, Framer Motion, and Tailwind CSS.
- 🔐 **Secure by Default:** Fully integrated with **Supabase Auth** and Row Level Security (RLS) to ensure your stories are safe and private.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + Vite
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Integrations:** 
  - Vercel AI SDK (Groq / Gemini)
  - ElevenLabs TTS API

## 🚀 Getting Started

### Prerequisites

You will need the following installed:
- [Node.js](https://nodejs.org/en/) (v18+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) account
- An [ElevenLabs](https://elevenlabs.io/) API Key (Optional, for Audiobooks)
- A Groq or Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/story-weaver-ai.git
   cd story-weaver-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Duplicate the `.env.example` file to `.env` and fill in your credentials:
   ```bash
   # Supabase Keys
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
   
   # AI Provider Keys
   GROQ_API_KEY="your-groq-key"
   ELEVENLABS_API_KEY="your-elevenlabs-key"
   ```

4. **Initialize Supabase Database:**
   Run the provided migration scripts inside `supabase/migrations/` in your Supabase SQL editor to create the necessary tables and RLS policies.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

## 📚 Features in Development (Roadmap)
- [ ] Interactive Branching Stories (Choose-Your-Own-Adventure)
- [ ] Comic Book Generator (Text-to-Image Panel Generation)
- [ ] Document Exports (PDF, ePub, Markdown)

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
