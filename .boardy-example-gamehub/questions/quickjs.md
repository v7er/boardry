---
question: "Why is QuickJS used?"
answer: "The finish handler runs in a QuickJS isolate with no process, no require, no network, a one second timeout, and 8 MB of memory."
evidence:
  - "[[handler-vm]]"
check: "grep -q 'QuickJS' .boardy-example-gamehub/modules/handler-vm.md"
status: verified
verified:
  by: human
  at: 2026-11-10
---
