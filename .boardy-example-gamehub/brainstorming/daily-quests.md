---
title: Daily quests and streaks
type: brainstorming
---
Idea: give each app a daily quest and a streak counter.

Maybe the quest is a game instance plus a target score, reset at local midnight. A streak is consecutive days with a finished session. Rewards could be virtual currency, but that opens a ledger and a fraud problem.

Questions:
- Is the quest defined per app, per game instance, or per player cohort?
- Which timezone decides "today" for a player who travels?
- Can a webhook drive the reward, or does it need its own event?
- Does the handler see the streak, or is that a separate service?
- Anti-cheat: the runtime score is client-supplied until the handler overrides it.

Do not link this note. It is free text until an idea becomes a real decision.
