---
title: Back office views
layer: prototypes
component: bo
kind: interface
summary: The operator console pages for spaces, users, catalog, deployments, runners, sessions, and webhooks.
links:
  - type: refines
    target: "[[bo]]"
  - type: relates_to
    target: "[[brand]]"
updated: 2026-11-10
---
The back office is a Next.js app for operators. It is smaller than the portal and oriented around curation and operations.

| Route | Screen |
| --- | --- |
| `/dashboard` | counts and recent activity |
| `/spaces`, `/spaces/create`, `/spaces/[id]` | tenant management |
| `/users`, `/users/create`, `/users/[id]` | account management and kind |
| `/games` | official and developer catalog |
| `/games/create` | create an official game from git |
| `/games/[id]` | game detail, deployments, versions |
| `/games/[id]/edit` | metadata and schema |
| `/games/[id]/editor` | embed the game editor |
| `/games/[id]/deployments/[deploymentId]` | build log and promote |
| `/runners`, `/runners/[id]` | generate a runner, read jobs |
| `/sessions` | play sessions across spaces |
| `/webhooks` | hooks and delivery history |
| `/login` | operator sign-in |

The runner page is the only place a runner pass is shown, and only once. The deployment page is where a READY preview becomes production.
