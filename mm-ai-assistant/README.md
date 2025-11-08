# MM AI Assistant

Standalone React application for MM AI Assistant, migrated from Magento PWA.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
VITE_AI_SEARCH_URL=your_api_url
VITE_AI_SEARCH_KEY=your_api_key
```

3. Run development server:
```bash
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack

- React 18
- Vite
- Ant Design 5
- React Router 6
- @microsoft/fetch-event-source (SSE streaming)
- markdown-it (Markdown parsing)
- react-speech-recognition (Voice input)
- react-intl (Internationalization)

