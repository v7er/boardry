---
title: SDK client
layer: modules
component: sdk
kind: module
summary: openapi-fetch with app credentials, generated from the SDK OpenAPI document.
links:
  - type: refines
    target: "[[sdk]]"
  - type: relates_to
    target: "[[api-sdk]]"
  - type: relates_to
    target: "[[play-runtime]]"
updated: 2026-11-10
---
`@fzgame/sdk` is a thin wrapper around `openapi-fetch`. The root entry has no React dependency; `@fzgame/sdk/react` adds `SDKInitializer`.

`initializeSDK({ apiUrl, appKey, appSecret })` sets the process-wide client. `createSdkClient(options)` returns an independent client for a process that serves more than one app. The headers are `x-app-key` (the app id) and `x-app-secret` (one credential secret).

The credentials authorize an application, so they belong on the customer's server. A browser bundle that inlines them publishes the secret. The browser receives only the play URL.

The host flow is listed in [[api-sdk]]. The package does not call the runtime itself; the game uses [[kit]] for that.

The checked-in types are generated from `apps/server/public/openapi-sdk.json`. The session routes and `/sdk/login` currently declare only 401 and 403 in the document, so those typed responses are empty until the spec is regenerated and the client recompiled. That is recorded in [[known-gaps]].
