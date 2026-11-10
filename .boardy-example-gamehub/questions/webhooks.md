---
question: "How do webhooks work?"
answer: "App and space hooks receive play-session events with an HMAC signature and retries."
evidence:
  - "[[webhooks]]"
check: "grep -q 'HMAC' .boardy-example-gamehub/modules/webhooks.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
