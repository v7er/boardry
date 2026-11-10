---
question: "What status does a zip publish set?"
answer: "ACTIVED. The zip path activates the game directly and does not stop at DRAFT."
evidence:
  - "[[publishing]]"
check: "grep -q 'ACTIVED' .boardry-example-gamehub/modules/publishing.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
