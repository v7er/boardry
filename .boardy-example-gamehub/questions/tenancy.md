---
question: "How does tenancy work, and what is a space?"
answer: "Space is the tenant boundary and App is the product boundary. Both ids are immutable."
evidence:
  - "[[tenancy]]"
check: "grep -q 'Space' .boardy-example-gamehub/modules/tenancy.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
