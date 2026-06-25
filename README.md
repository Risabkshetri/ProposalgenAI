# ProposalgenAI

ProposalgenAI is an AI-powered Proposal Generator that transforms raw client notes into high-fidelity, print-ready PDF proposals. It features a modern web interface to preview the proposal and a powerful backend that utilizes Gemini AI for information extraction and WeasyPrint for generating pixel-perfect, 1:1 "Xerox" PDF copies of the HTML templates.

## Features
- **AI Text Extraction**: Uses Google's Gemini 2.5 Flash to automatically parse and extract structured data (Client Info, Sender Info, Project Details) from raw conversational notes.
- **Pixel-Perfect PDF Generation**: Employs WeasyPrint on the backend to render flawless, print-ready PDF proposals without layout spacing or clipping issues.
- **Modern Interface**: A sleek frontend built with Next.js 16, React 19, and Tailwind CSS v4.
- **Robust Fallbacks**: Gracefully falls back to heuristic data extraction if the Gemini API is unavailable.

## Tech Stack
**Frontend:**
- [Next.js](https://nextjs.org/) (v16)
- [React](https://react.dev/) (v19)
- [Tailwind CSS](https://tailwindcss.com/) (v4)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- [Google GenAI SDK](https://ai.google.dev/) (Gemini 2.5 Flash)
- [WeasyPrint](https://weasyprint.org/)

---

## Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v20+ recommended)
- **Python** (v3.10+ recommended)
- **pnpm** (or npm/yarn) for frontend package management
- **System dependencies** required by WeasyPrint (e.g., `pango`, `cairo`, `libffi`). See the [WeasyPrint Installation Guide](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation) for your OS.

---

## Project Initialization & Setup

This repository is structured as a monorepo containing both the frontend (`proposalgen_frontend`) and backend (`proposalgen_backend`).

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd proposalgen_backend
```

**Create and activate a virtual environment:**
```bash
# For macOS/Linux
python -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in the `proposalgen_backend` directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If no API key is provided, the app will safely fall back to a mock data structure.)*

**Run the backend server:**
```bash
# Ensure your virtual environment is activated
fastapi dev main.py
# OR
uvicorn main:app --reload
```
The FastAPI backend will be available at `http://localhost:8000`. You can explore the API docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

Open a **new** terminal and navigate to the frontend directory:
```bash
cd proposalgen_frontend
```

**Install dependencies:**
Using `pnpm` is recommended for this project:
```bash
pnpm install
# OR npm install
```

**Run the development server:**
```bash
pnpm dev
# OR npm run dev
```
The Next.js frontend will be available at `http://localhost:3000`.

---

## Usage
1. Make sure both the backend and frontend servers are running simultaneously.
2. Open your browser and navigate to `http://localhost:3000`.
3. Paste raw conversational client notes or requirements into the designated input area.
4. Click generate to allow the Gemini AI to extract the structured information and dynamically populate the proposal template.
5. Preview the results, and hit the **Download PDF** button to trigger the WeasyPrint engine, generating a flawless, print-ready document.
