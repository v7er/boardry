# Ship a game on GameHub — complete authoring and publishing guide

Grounded in the GameHub board (`.boardry-example-gamehub/`) and the repo docs:
`GUIDE.md`, `packages/kit/README.md`, `packages/cli/README.md`,
`packages/cli/src/fzgame.schema.json`, and the `fzgame-sample` pack.

---

## 0. What "complete" actually means

A game is **four files/folders plus a catalog row**:

| Path | Loaded as | Job |
| --- | --- | --- |
| `fzgame.json` | Manifest | Identity + four JSON Schemas |
| `game/` | Player iframe | Draw the game, drive the session |
| `editor/` | Studio iframe | Edit the instance config |
| `handler/` | Server VM on `finish` | Turn the finish into stored score/result |

Do not add a bundler, a server, or extra top-level folders. `fzgame build` zips
exactly `fzgame.json` + `game/` + `editor/` + `handler/` and vendors the kit into
`game/vendor/kit.js`.

There are **three separate publishes** people conflate. All three are needed before
a player can actually play:

1. **Pack publish** → creates the catalog `Game` (`ACTIVED` via zip).
2. **Instance publish** → makes that game playable inside one app (`DRAFT` → `PUBLISHED`).
3. **Deploy/promote** → only for the git path; a build is `READY` until promoted.

---

## 1. Prerequisites and who may publish

- **Node 20+** and npm.
- For local development: nothing else. `fzgame dev` ships a mock runtime.
- For publish: a reachable GameHub API (default `http://localhost:3020`).
- Credentials depend on the origin you want:

| Origin | Who publishes | Endpoint | Visibility |
| --- | --- | --- | --- |
| `OFFICAL` | operator (`UserKind.OPERATOR`) | `POST /games/publishing` | public catalog when `ACTIVED` |
| `SPACE_PRIVATE` | space `ADMIN` or `DEVELOPER` | `POST /portal/games/publishing` | only that space |
| `DEVELOPER` | publisher without a space | API path exists | public catalog when `ACTIVED` |

The CLI covers the first two. A portal/space token on the official path returns
401/403.

For real play you also need an **app** (created in the portal) to host instances.

---

## 2. Scaffold the pack

```bash
npm i -g @fzgame/cli
fzgame init my-game --name "Quiz Battle" --slug quiz-battle
cd my-game
fzgame dev
```

`init` copies the `fzgame-sample` template and stamps `info.name` / `info.slug`.
It refuses a non-empty directory unless you pass `--force`; an existing
`.gitignore` is kept.

```text
my-game/
  fzgame.json
  game/index.html
  editor/index.html
  handler/index.js
  dist/                 # build output, generated
```

Open <http://127.0.0.1:3400>. With the portal running, attach the studio sandbox at
<http://localhost:3000/game-editor/sandbox>.

From a monorepo checkout instead:

```bash
pnpm --filter @fzgame/kit build
pnpm --filter @fzgame/cli build
node packages/cli/dist/cli.cjs init my-game
node packages/cli/dist/cli.cjs dev --cwd my-game
```

---

## 3. `fzgame.json`, field by field

Canonical schema: `packages/cli/src/fzgame.schema.json`
(`$id: https://fzgame.dev/schema/fzgame.json`). It is strict:
`additionalProperties: false` at the top level and inside `info`, so an unknown
key fails validation. Five keys are required.

```json
{
  "info": {
    "name": "Quiz Battle",
    "slug": "quiz-battle",
    "version": 1,
    "image": "",
    "description": "Answer fast, score high.",
    "author": "Your Team",
    "git_url": ""
  },
  "entry": {
    "game": "game/index.html",
    "editor": "editor/index.html",
    "handler": "handler/index.js"
  },
  "viewMode": "portrait",
  "formSchema": {
    "type": "object",
    "required": ["goal"],
    "properties": {
      "goal": { "type": "integer", "title": "Goal", "default": 10, "minimum": 1 }
    }
  },
  "formUiSchema": { "accent": { "ui:widget": "color" } },
  "resultSchema": {
    "type": "object",
    "required": ["score", "won"],
    "properties": {
      "score": { "type": "integer", "minimum": 0 },
      "won": { "type": "boolean" }
    }
  },
  "snapshotSchema": {
    "type": "object",
    "properties": {
      "score": { "type": "integer", "default": 0 },
      "lives": { "type": "integer", "default": 3 }
    }
  },
  "gameDataSchema": { "type": "object", "properties": {} },
  "screenshots": ["screenshots/lobby.png"]
}
```

| Field | Rules |
| --- | --- |
| `info.name` | string, min 2 chars |
| `info.slug` | kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `info.version` | integer ≥ 1, default `1` |
| `info.image` | URL or pack-relative path |
| `info.git_url` | http(s) URL |
| `entry` | optional; the three paths above are the defaults |
| `formSchema` | JSON Schema for instance config; `kit.config()` starts from property `default`s |
| `formUiSchema` | optional JSON Forms / RJSF widgets |
| `resultSchema` | shape of the stored `finish` / handler result |
| `snapshotSchema` | shape of mid-play state (`setState`) |
| `gameDataSchema` | persistent instance/content data |
| `screenshots` | array of http(s) URLs or pack-relative paths; relative files are zipped and resolved to registry URLs |
| `viewMode` | `portrait` (default) or `landscape`; landscape is rotated 90° by the portal on a portrait phone |

Legacy flat `{ name, slug, version, configSchema }` still parses
(`configSchema` is an alias for `formSchema`). Do not mix both forms.

**Versioning:** `slug` + `version` is unique. Bump `version` for a new pack;
`--force` overwrites the same one in place. Never reuse a version for different
content — sessions and leaderboards reference the row.

---

## 4. `game/` — the play surface

The host (portal, customer app, or `fzgame dev`) builds the URL and passes the
credentials. The game must not hardcode anything:

```text
{resolvedUrl}?apiUrl=…&gameInstanceId=…&playerToken=<AppPlayer.identity>&kit=./vendor/kit.js
```

| Query | Meaning |
| --- | --- |
| `apiUrl` | GameHub origin (`http://127.0.0.1:3400` in dev) |
| `gameInstanceId` | instance being played |
| `playerToken` | `AppPlayer.identity` for the app; the host creates the player first |
| `kit` | kit module URL: `/@fzgame/kit.js` in dev, `./vendor/kit.js` after build |
| `preview` | `true` / `1` / `yes` — in-memory session, no server writes |
| `gameSetting` | JSON config; studio puts unsaved editor values here (wins over `config`) |
| `config` | legacy JSON config |

### 4.1 Boot and resume — the one branch every game gets wrong

```js
const params = new URLSearchParams(location.search)
const kitUrl = params.get('kit') || './vendor/kit.js'
const { createKit } = await import(kitUrl)

const kit = createKit()
await kit.load()     // GET /pub/game-instances/{id}
await kit.connect()  // POST /games/runtime/sessions — create OR resume

const status = kit.snapshot.status
if (status === 'CREATED') {
  await kit.emit('ready')
  await kit.emit('start')
} else if (status === 'READY') {
  await kit.emit('start')
} else if (status === 'PLAYING' || status === 'PAUSED') {
  // resume: restore from kit.snapshot.state, do NOT emit start unconditionally
} else {
  // FINISHED / ABORTED / EXPIRED: show the result, emit nothing
}
```

`connect()` returns the player's newest `CREATED` / `READY` / `PLAYING` /
`PAUSED` session for that instance. A terminal session is never resumed; the next
connect starts a new round. Sessions expire 24 hours after creation.

### 4.2 Config merge

`kit.config()` in increasing priority:

1. `formSchema` property `default`s,
2. instance `overrides` (editor save on a real instance),
3. `createKit({ config })` / `?gameSetting` / `?config`.

The kit does not validate the merged object. Validate on your side against the
schema you already know (`readFormSchema(schema)` returns it).

### 4.3 Lifecycle — the server owns the state machine

```
CREATED ──ready──► READY ──start──► PLAYING ⇄ PAUSED
                         ╲            │
                          abort       finish
                           ▼          ▼
                        ABORTED     FINISHED

EXPIRED is set by the 24h TTL sweep, never by an emit.
```

| Emit | Allowed from | Result |
| --- | --- | --- |
| `ready` | `CREATED` | `READY` |
| `start` | `CREATED`, `READY`, `PAUSED` | `PLAYING`, stamps `startedAt` once |
| `pause` | `PLAYING` | `PAUSED` |
| `finish` | `PLAYING`, `PAUSED` | `FINISHED`, stores `{ score?, result? }`, runs the handler |
| `abort` | `CREATED`, `READY`, `PLAYING`, `PAUSED` | `ABORTED` |
| `score` | any active state | status unchanged, stores score/result |
| `snapshot` | any active state | status unchanged, stores `state` |
| any other string | any active state | stored as `metadata.lastEvent` |

Illegal moves throw (`Cannot transition session from PLAYING to READY`,
`Session is FINISHED and cannot accept events`). Same-status emits are no-ops.
`emit` / `setState` throw before `connect()`. Two events fired in the same tick
are serialized, so the server sees them in order.

Drive UI from `kit.snapshot.status`, not a local guess.

### 4.4 Resume state

```js
let score = kit.snapshot.state?.score ?? 0   // hydrated by connect()
await kit.setState({ score })                // PUT …/snapshot, merge-safe
```

`setState` is the only thing that survives a reload mid-round. `resetState()`
restores the state the session started from (for a second round on the same
session). A `finish` is terminal — the result screen must offer "play again",
which reconnects and creates a new session.

### 4.5 Leaderboard — required, not optional

Every game must ship a leaderboard for the instance, reachable from both the
start and the result screens.

```js
const { data, pageInfo } = await kit.getLeaderboard({ board: 'players', page: 1, limit: 10 })
// row: { rank, player: { id, displayName, avatarUrl }, score, sessionId, finishedAt }
// pageInfo: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
```

- `board: 'players'` (default) — one row per player, best finished session.
- `board: 'sessions'` — every finished session.
- `limit` ≤ 100; only `FINISHED` sessions with a score rank.
- Anonymous endpoint, works inside the iframe. Preview answers an empty page;
  `fzgame dev` answers a mock board. Handle the empty state.

### 4.6 Host-supplied token or session

A host that identifies the player after the frame loaded sends a message:

```js
import { onHostSession } from './vendor/kit.js'
const stop = onHostSession((msg) => kit.applyHostSession(msg))
```

Payload: `{ source: 'fzgame-host', type: 'session', playerToken?, playSessionToken?, snapshot? }`.
`kit.player` is `{ id, identity, displayName, avatarUrl }` until a session is known.
`playSessionToken` continues that exact session; a `snapshot` in the message wins.

### 4.7 Errors and timeouts

| Failure | Meaning |
| --- | --- |
| `Error` | missing option, `connect()` without `playerToken`, emit before connect |
| `KitApiError` | non-OK response: `status`, `statusText`, `method`, `url`, `body`, `code` |
| `KitTimeoutError` | request exceeded `timeoutMs` (default 30 s) |

The kit does **not retry**. A `finish` during a network blip is lost — keep the
finish payload locally and offer a retry, or finish again on the result screen.

### 4.8 Presentation and path rules

- The pack is served from `{slug}/v{version}/game/…` on S3/MinIO. All asset URLs
  must be **relative** (`./art/tile.png`), never `/art/…`.
- No bundler: `game/`, `editor/`, `handler/` are plain entries. The kit is the
  only shared code and `fzgame build` vendors it.
- The game runs in an iframe. Do not rely on `window.top`, cookies, or
  cross-origin storage.
- `viewMode: landscape` only reports orientation; the portal rotates the frame on
  phones. Your canvas must still fill whatever viewport it gets.
- Escape every player-supplied string you insert into the DOM (the sample uses an
  `escapeHtml` helper).

---

## 5. `editor/` — instance configuration

The editor is a second iframe. It renders `formSchema` (with `formUiSchema`
widgets) and reports a draft config to the host.

Host → editor:

```js
{ source: 'fzgame-host', type: 'init', config, configSchema, gameInstanceId }
```

`configSchema` is the unwrapped `formSchema`.

Editor → host:

```js
{ source: 'fzgame-editor', type: 'ready' }
{ source: 'fzgame-editor', type: 'save', config: { goal: 20, accent: '#228be6' } }
```

With helpers:

```js
import { onHostInit, postEditorSave } from './vendor/kit.js'

onHostInit(({ config }) => fillForm(config))
parent.postMessage({ source: 'fzgame-editor', type: 'ready' }, '*')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  postEditorSave(readForm())
})
```

Behaviour:

- **Studio sandbox / preview**: the save is applied as `?gameSetting` to the play
  frame; nothing is persisted.
- **Real instance**: the save also PATCHes the instance `overrides`.
- `fzgame dev` has no parent to persist into — the editor page is for UI checking
  only.

Keep the editor usable at phone width, keyboard-navigable, and validating the
same constraints as `formSchema`. A save that fails validation should not post.

---

## 6. `handler/` — server-side authority

Runs only on a real `finish`, in a QuickJS isolate:

- no `process`, no `require`, no network;
- 1 second timeout, 8 MB memory, 128 KB source cap;
- sources cached (max 64 entries / 8 MB).

```js
export default function onFinish(payload) {
  const result = payload.result || {}
  const config = payload.config || {}
  const clicks = Math.max(0, Math.floor(Number(result.clicks) || Number(payload.score) || 0))
  const goal = Math.max(0, Math.floor(Number(config.goal) || 0))
  return {
    score: clicks,
    result: { clicks, reachedGoal: goal > 0 ? clicks >= goal : false },
  }
}
// or: export default { onFinish }
```

`payload`:

```js
{
  score,      // from emit('finish', { score, result })
  result,     // from the game
  config,     // instance overrides (studio: current editor config)
  session: { id, token, playerId, gameInstanceId, appId, spaceId }  // omitted in studio test
}
```

Rules:

- A numeric returned `score` **replaces** the client score.
- A returned `result` replaces the client result; if the object has no `result`
  key, the whole object is stored as `result`.
- A throw keeps the client payload and stores `metadata.handlerError` — the
  session still finishes. Do not rely on the handler for critical bookkeeping.
- Match `resultSchema`. Test it in studio: finish in the sandbox and read
  **Handler result** in the Events console (`POST /games/runtime/handler`,
  no persisted session).
- The handler is the only server-trusted scoring point; the client score is
  advisory until then. Do not put secrets or network calls in it.

---

## 7. Local development

```bash
fzgame dev --cwd my-game          # -p 3400, --host 127.0.0.1
```

The dev server provides:

- static `game/`, `editor/`, `handler/` from the game root;
- `@fzgame/kit` at `/@fzgame/kit.js`;
- a mock runtime (`/games/runtime`, `/pub/game-instances`) with in-memory sessions;
- `/health` for the portal sandbox (open CORS).

Launcher URL:

```text
/game/index.html?gameInstanceId=dev-instance&playerToken=dev-player&apiUrl=http://127.0.0.1:3400&kit=/@fzgame/kit.js
```

If `/@fzgame/kit.js` 404s, rebuild the kit (`pnpm --filter @fzgame/kit build`, or
reinstall the CLI). The server reads from disk on each request — reload the browser.

`--host 0.0.0.0` exposes the unauthenticated mock runtime to the LAN. Keep the
default.

### Preview mode

`?preview=true` skips every server call: `load`, `connect`, `emit`, `setState` run
in memory with the same rules. Credentials become optional. The studio always plays
this way. Preview hides server bugs — always test once on a real published instance.

### Debug channel

In a frame the kit posts `{ source: 'fzgame-kit', type: 'debug', event, payload, at }`
to the parent (`load` | `connect` | `emit` | `snapshot`), with token-like keys
redacted. The portal Events console shows them.

---

## 8. Test matrix before you build

| Case | Expected |
| --- | --- |
| Fresh instance, first play | `CREATED` → `READY` → `PLAYING` |
| Reload mid-round | resumes `PLAYING`, score/state restored from snapshot |
| Pause → reload | resumes `PAUSED`, no `start` until Resume |
| Finish → reload | terminal, result screen, next connect = new round |
| `finish` from `CREATED` | throws; game must not call it |
| Emit after finish | throws; UI must disable play |
| Session older than 24 h | `EXPIRED`, new round |
| Banned player | connect/login 403; show a clear message |
| Unknown instance | 404; show a fatal state, not a blank screen |
| Leaderboard empty | empty state, not an error |
| Handler throws | round still finishes; result from client payload |
| Network drop at finish | kit rejects; game offers retry |
| Landscape on a phone | frame rotates; canvas fills it |
| Preview | no network writes; config from `gameSetting` |
| Editor save on instance | overrides PATCHed, Play reloads with them |

---

## 9. Build and pack

```bash
fzgame build --cwd my-game
# dist/<slug>-v<version>.zip
```

`build` validates `fzgame.json` against the schema, vendors `@fzgame/kit` into
`game/vendor/kit.js`, and zips `fzgame.json` + `game/` + `editor/` + `handler/`
(+ any pack-relative screenshot files).

Server-side limits on upload:

| Limit | Value |
| --- | --- |
| zip size | 50 MB |
| entries | 5,000 |
| uncompressed total | 200 MB |
| `fzgame.json` | 1 MB |
| paths | no `..`, no leading `/` |

The published layout is `{slug}/v{version}/game/…`, `…/editor/…`, `…/handler/…`.
Previews use `{slug}/preview/{sha}/…` instead.

---

## 10. Publish

### Official (operator, public catalog)

```bash
fzgame login --api http://localhost:3020 --email admin@example.com
fzgame build  --cwd my-game
fzgame publish --cwd my-game
```

`login` checks `UserKind.OPERATOR` and stores the session in `~/.fzgame/auth.json`
(mode 0600; override the directory with `FZGAME_CONFIG_DIR`). `--token` /
`FZGAME_TOKEN` still win. In CI, set `FZGAME_PASSWORD` or pass `--token`.

Raw token path:

```bash
TOKEN=$(curl -sS http://localhost:3020/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"admin@x.com","password":"admin123"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

fzgame publish --cwd my-game --api http://localhost:3020 --token "$TOKEN"
```

Optional flags: `--api`, `--space <id>`, `--force`, `--token`.

### Space-private (tenant)

```bash
fzgame publish --cwd my-game --space <spaceId>
```

Requires space `ADMIN` or `DEVELOPER`; hits `POST /portal/games/publishing`.

### What the server does

1. Reads the multipart `file`, validates the zip bounds.
2. `yauzl`-inspects it and reads `fzgame.json`.
3. `parseFzGameManifest` validates identity, entries, schemas.
4. Resolves the origin from the caller (and rejects a `spaceId` on an official
   publish).
5. Rejects duplicate `slug` + `version` unless `--force`; a forced overwrite must
   stay in the same origin and space.
6. Streams entries to S3 (`{slug}/v{version}/…`), resolves cover/screenshots.
7. Creates or updates the `Game` with **`status: ACTIVED`** — the zip path
   activates immediately, it does not stop at `DRAFT`.

Success prints `Published <slug>@<version> (<id>)` plus the play URL. Stored URLs
are registry-relative; `RegistryUrlInterceptor` rewrites them on the way out
(`REGISTRY_URL` → `S3_CDN_DOMAIN` → S3 endpoint + bucket).

### Duplicate and force rules

- Same `slug` + `version` → rejected.
- `--force` → replaces the stored artifacts and updates the existing catalog row
  in place.
- Different origin or space → refused even with force.
- New content → bump `version` (separate row, keeps history/leaderboards).

---

## 11. Make it playable — the instance

Publishing the pack does **not** make it playable. Inside the tenant portal:

1. `POST /portal/apps/{appId}/game-instances` — the template game must be
   `ACTIVED`. The instance starts `DRAFT` and copies `game.entryPointUrl` into
   `resolvedUrl`.
2. Set `overrides` via the editor (`formSchema` values).
3. `PUT /portal/game-instances/{id}/publish` → `PUBLISHED`, stamps `resolvedAt`.
4. `POST /portal/game-instances/{id}/resolve` after a deployment moved the entry
   point (git path) to re-read it.

Only `PUBLISHED` instances appear in `GET /sdk/game-instances` and
`GET /pub/game-instances/{id}`. The public detail omits `unlockToken` and relation
lists, and derives `editorUrl` by replacing `/game/` with `/editor/`.

### Host flow (customer backend, `@fzgame/sdk`)

1. `GET /sdk/game-instances` — only published instances, each with `game`.
2. `POST /sdk/login` — upsert on `(appId, identity)`, returns the player.
   `identity` is the host's own user id and becomes `playerToken`.
3. Build `{resolvedUrl}?apiUrl=…&gameInstanceId=…&playerToken=…` (optionally
   `gameSetting`).
4. The game calls `POST /games/runtime/sessions`. The host does **not** create the
   session and never puts the app secret in the frame.
5. Continue screen: `GET /sdk/sessions/active?playerId=…&gameInstanceId=…` →
   `{ session }` or `null`.
6. Late identification: post the `session` message; `kit.applyHostSession()` adopts it.

`playerId` (`AppPlayer.id`) and `playerToken` (`AppPlayer.identity`) are different
values.

### Integrations

- **Webhooks**: `SESSION_CREATED`, `SESSION_STARTED`, `SESSION_FINISHED`,
  `SESSION_ABORTED`, `SCORE_UPDATED`, `CUSTOM`. Persisted deliveries, 5 attempts,
  exponential backoff, HMAC-SHA256 over `timestamp.body` in
  `x-webhook-signature` with `x-webhook-timestamp`. Verify and reject old
  timestamps.
- **Leaderboards**: per instance (`/pub/game-instances/{id}/leaderboard/...`) and
  across published instances of the game (`/pub/games/{id}/leaderboard/...`).

---

## 12. Updating a game later

| Change | Do |
| --- | --- |
| Content/feature update | bump `info.version`, build, publish |
| Same version, hotfix | `publish --force` (same origin/space) |
| Take it out of the catalog | `PUT /games/{id}/delist` (back to `DRAFT`), `…/archive` |
| Git-delivered game | push to the tracked branch → deployment `QUEUED` → runner builds `READY` → promote → production; rollback promotes an earlier `READY` |
| New orientation | update `viewMode`, republish |

Git path records: `GitConnector` → `GitSource` → `Deployment` → `CiRunner`. Push
hits `POST /webhooks/github` (raw body + HMAC). Runners claim queued jobs, clone,
`fzgame build`, upload artifacts. A promotion writes `entryPointUrl`,
`backendUrl`, and `configSchema` onto the `Game` and sets `ACTIVED`. Deployment
statuses: `QUEUED`, `BUILDING`, `READY`, `ERROR`, `CANCELED`; unique on
`(gameId, version, commitSha)`.

---

## 13. Security checklist

- Never ship the app secret, operator token, or any credential in the pack. The
  pack is public by design.
- `playerToken` is a bearer identity today — anyone holding it can act as that
  player. Do not put it in logs or screenshots; treat it as impersonatable until
  a signed per-player token exists.
- Escape all player names/strings rendered in the game, editor, and leaderboard.
- Score is client-supplied until the handler rewrites it. Do the authoritative
  scoring in `handler/index.js`, not in the iframe.
- The handler is sandboxed: no network, no FS, 1 s, 8 MB, 128 KB. Keep it pure and
  deterministic.
- Webhook consumers must verify HMAC and reject stale timestamps.
- `fzgame dev --host 0.0.0.0` is unauthenticated. Do not expose it.

---

## 14. Known traps

- Emitting `start` on every boot breaks resume semantics (it is a no-op in
  `PLAYING`, but a `start` from `CREATED` skips `READY` UI assumptions).
- Calling `finish` from `CREATED` throws.
- Emitting before `connect()` throws.
- Bundling the kit yourself instead of letting `build` vendor it.
- Absolute asset paths (`/game/art.png`) break under `{slug}/v{version}/…`.
- Extra manifest keys are rejected (`additionalProperties: false`).
- Extra top-level folders are not zipped; only the four pack parts are.
- Preview hides server-side failures; verify on a published instance.
- `fzgame login` is operator-only; a portal user cannot publish official.
- Git sources default `manifestPath` to `gamehub.json` while docs/CLI use
  `fzgame.json` — set it explicitly if a git import cannot find the manifest.
- No session-history endpoint: `/sdk/sessions/active` only returns the newest live
  session. A "past rounds" screen needs another surface (or your own store).
- Billing is not implemented; `SPACE_CREATION_REQUIRES_PAYMENT` can 402.

---

## 15. Done checklist

- [ ] Pack has exactly `fzgame.json`, `game/`, `editor/`, `handler/`
- [ ] Manifest validates; slug kebab-case; version bumped; schemas describe real
      config/result/snapshot shapes
- [ ] `game/` boots from query params, handles all five resume branches, drives
      status from `kit.snapshot`
- [ ] Config merge order respected; defaults sane without overrides
- [ ] Mid-round reload restores state; finish is terminal; "play again" works
- [ ] Leaderboard screen reachable from start and result, empty state handled
- [ ] Editor renders `formSchema`, validates, posts `ready` and `save`
- [ ] Handler returns `{ score, result }` matching `resultSchema`, stays under
      128 KB, tested via studio
- [ ] `fzgame dev` clean; preview clean; tested on a real published instance
- [ ] `fzgame build` produces the zip; `unzip -l` shows only the four parts
- [ ] Publish (official or `--space`), confirm `ACTIVED`
- [ ] Create instance → set overrides → publish instance → play end to end
- [ ] Webhook delivery observed; leaderboard row appears
- [ ] No secrets, no absolute paths, no unescaped player input
