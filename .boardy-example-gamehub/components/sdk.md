---
title: SDK
layer: components
component: sdk
kind: component
summary: The server-to-server typed client in packages/sdk, for a customer backend that hosts GameHub games.
links:
  - type: refines
    target: "[[vision]]"
  - type: contains
    target: "[[sdk-client]]"
updated: 2026-11-10
---
`packages/sdk` is `@fzgame/sdk`, a typed HTTP client built on `openapi-fetch`. It is the server-to-server surface for a customer backend, authenticated with `x-app-key` and `x-app-secret`.

The normal host flow is:

1. list published game instances for the app;
2. identify or create a player;
3. build the play URL;
4. let the game create or resume the session.

The app secret stays on the customer's server. It never appears in the play URL or the browser.

The client and the host flow are in [[sdk-client]]. The endpoints are in [[api-sdk]].
