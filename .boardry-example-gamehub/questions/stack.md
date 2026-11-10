---
question: "What stack is allowed?"
answer: "NestJS, Express, Prisma, ZenStack, better-auth, Next, React, Mantine, and the listed SDK and tooling. Check the whitelist before adding anything."
evidence:
  - "[[stack]]"
check: "grep -q 'NestJS' .boardry-example-gamehub/whitelist/stack.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
