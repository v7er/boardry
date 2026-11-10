---
question: "How is OpenAPI generated?"
answer: "The zmodel and controller annotations generate the specs, and the specs generate every client type."
evidence:
  - "[[openapi-pipeline]]"
check: "grep -q 'zmodel' .boardy-example-gamehub/technical/openapi-pipeline.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
