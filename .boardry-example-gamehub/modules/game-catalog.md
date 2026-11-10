---
title: Game catalog
layer: modules
component: api
kind: module
summary: The Game model, its three origins, its statuses, and the unique slug plus version.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[publishing]]"
  - type: relates_to
    target: "[[deployment]]"
updated: 2026-11-10
---
`Game` is the catalog record. It is unique on `(slug, version)` and carries:

- `name`, `slug`, `version`, `description`, `coverImageUrl`, `screenshots`;
- `status` of `DRAFT`, `ACTIVED`, or `ARCHIVED`;
- `origin` of `OFFICAL`, `DEVELOPER`, or `SPACE_PRIVATE`;
- `configSchema` as JSON, which stores `viewMode` and the four game schemas;
- `entryPointUrl` and `backendUrl`, cached from the production deployment;
- `productionDeploymentId`, which points at the promoted deployment;
- `categoryId`, `creatorId`, and `spaceId`.

Origin is the visibility rule:

| Origin | creatorId | spaceId | Visible to |
| --- | --- | --- | --- |
| `OFFICAL` | null | null | public catalog when ACTIVED |
| `DEVELOPER` | set | null | public catalog when ACTIVED |
| `SPACE_PRIVATE` | set | set | only that space |

The spelling `OFFICAL` and `ACTIVED` is upstream and appears in the database. Do not "fix" it in a query without a migration.

The public catalog only returns `ACTIVED`, non-private, non-deleted games. The studio catalog returns the caller's space-private games. The operator catalog returns official and developer games, drafts included.

A game can be created from a zip or from a connected git repository. The zip path is in [[publishing]]; the git path is in [[deployment]].
