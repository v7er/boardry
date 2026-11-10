---
question: "How does the SDK identify players?"
answer: "An AppPlayer is unique on appId plus identity, and the identity string is the player token."
evidence:
  - "[[players]]"
check: "grep -q 'identity' .boardry-example-gamehub/modules/players.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
