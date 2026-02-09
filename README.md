# Saran AI Chat Frontend

A React frontend for the Saran AI chatbot experience. It includes a landing page, login/signup, and a chat interface with conversation history and model selection.

## Requirements

- Node.js 18+ (or any recent LTS version)
- npm

## Clone

```bash
git clone https://github.com/HuzaifaSaran0/chatbot_frontend.git
cd chatbot_frontend
```

## Install

```bash
npm install
```

## Configure (optional)

To enable Google sign-in, create a `.env` file and set:

```bash
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Run locally

```bash
npm start
```

Open `http://localhost:3000` in your browser.

## Build for production

```bash
npm run build
```

## Tests

```bash
CI=true npm test -- --watchAll=false
```

## Backend API

This frontend expects a chatbot API to be available for authentication and chat. The API base URLs are currently set in the source files; update them if you are running a different backend.
