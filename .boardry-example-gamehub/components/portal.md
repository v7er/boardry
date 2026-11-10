---
title: Tenant portal
layer: components
component: portal
kind: component
summary: The customer-facing Next.js app in apps/portal on port 3000.
links:
  - type: refines
    target: "[[vision]]"
  - type: contains
    target: "[[portal-views]]"
updated: 2026-11-10
---
`apps/portal` is the tenant portal: Next.js 15, React 19, Mantine 8, TanStack Query, and Zustand.

It covers the customer's day-to-day work:

- spaces and members;
- apps and app credentials;
- game instances and their editors;
- the public catalog and game previews;
- players, play sessions, and leaderboards;
- git sources, deployments, and webhooks;
- the API docs page and profile.

The browser never calls the API cross-origin. `src/middleware.ts` rewrites `/api/*` to `NEXT_PUBLIC_API_URL` and turns the `access_token` cookie into an `Authorization: Bearer` header. The client types are generated from `openapi-portal.json`.

The screens are in [[portal-views]].
