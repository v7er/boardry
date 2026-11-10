---
title: Back office
layer: components
component: bo
kind: component
summary: The operator console in apps/bo on port 3003.
links:
  - type: refines
    target: "[[vision]]"
  - type: contains
    target: "[[bo-views]]"
updated: 2026-11-10
---
`apps/bo` is the internal operator console: Next.js 14, React 18, Mantine 7, TanStack Query, and Jest.

Operators use it to:

- manage spaces and users;
- curate the official catalog and templates;
- inspect games, deployments, and build logs;
- generate and inspect CI runners;
- read play sessions across spaces;
- inspect webhooks and deliveries.

It uses the same `/api/*` rewrite as the portal but against `openapi-admin.json` and an operator session. The operator routes are guarded by `OperatorGuard`.

The screens are in [[bo-views]].
