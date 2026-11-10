---
question: "What happens when a session finishes?"
answer: "The session moves to FINISHED, the score and result are stored, and the game handler runs in the QuickJS isolate."
evidence:
  - "[[play-runtime]]"
  - "[[handler-vm]]"
check: "grep -q 'FINISHED' .boardry-example-gamehub/modules/play-runtime.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
