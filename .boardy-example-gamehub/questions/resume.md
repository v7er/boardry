---
question: "How does resume work?"
answer: "connect() finds the newest live session for the player and instance and hydrates state from the stored snapshot. A terminal session is not resumed."
evidence:
  - "[[play-runtime]]"
check: "grep -q 'resume' .boardy-example-gamehub/modules/play-runtime.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
