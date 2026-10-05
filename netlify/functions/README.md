# Ask Ghulam - portfolio chatbot

AI chat widget that answers questions about Ghulam Ghous, grounded only on
`ghulam.json` (the single source of truth). No facts are invented: the system
prompt refuses out-of-scope questions and treats user input as untrusted.

## Files

- `ghulam.json` - structured profile data (skills, projects, contact, availability).
  Edit this to update what the chatbot knows.
- `chat.js` - Netlify Function (`POST /.netlify/functions/chat`). Reads
  `OPENAI_API_KEY` from the environment, validates and rate-limits input,
  calls the OpenAI chat completions API, returns `{ reply }` as JSON.
- `../../chat-widget.js` - vanilla-JS floating chat widget (all pages).
  Streaming-style typewriter reveal, suggestions, error/retry states,
  keyboard support (Escape closes), visible "AI-generated" label.

## Setup (owner must do this)

1. In the Netlify dashboard: Site settings > Environment variables >
   add `OPENAI_API_KEY` (get one at platform.openai.com).
   Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).
2. Deploy this folder with the site (drag-drop ZIP works; `netlify/functions`
   is auto-detected).
3. Without the key, the widget shows "Chat is not set up yet" and the
   function returns 503 - nothing breaks.

## Design decisions

- API key lives only server-side; the browser never sees it.
- Input guards: max 10 messages of history, 500 chars per message,
  last message must be from the user.
- Rate limit: 20 requests/hour per IP, in-memory (best effort - serverless
  instances don't share memory; upgrade to Netlify Edge Config/Redis for
  strict limits).
- Prompt-injection resistance is in the system prompt: user text is untrusted,
  the prompt itself is never revealed, out-of-scope questions get the
  contact fallback.
- v1 returns complete replies (standard Netlify Functions don't stream);
  the widget reveals text with a typewriter effect. True SSE streaming is
  a follow-up (needs Edge Functions).

## Limitations

- Answers are only as current as `ghulam.json` - update it when facts change.
- No conversation memory across page loads (history lives in the widget only).
- Costs: each message is one OpenAI API call on the owner's key.
