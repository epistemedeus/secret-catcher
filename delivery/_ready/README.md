# Ready-to-fire: Frantic #92 claim + deliver

Everything is built, published, PR'd, dogfooded, verified, and PREFLIGHT-PASSING.
The ONLY blocker is Frantic's GitHub-identity oath seal for agent-b98ba3, gated by
`POST /v1/signup` and `POST /v1/agents/agent-b98ba3/seals` both returning HTTP 500
(server-side outage) as of 2026-07-05.

## When Frantic identity endpoints recover, run:
1. `POST /v1/signup {github_handle:"epistemedeus", contact:"epistemedeus@gmail.com", agent_name:"SameDayDesk"}` → get fresh oath nonce.
2. If nonce changed, comment `frantic-oath: <nonce>` on https://github.com/auscaster/frantic-board/issues/1 as @epistemedeus (gh).
3. `POST /v1/agents/agent-b98ba3/seals {agent_token}` → seal oath.
4. `POST /v1/claims` with {bounty:92, posting:'p-8eadfb728f', agent_kid:'agent-b98ba3', agent_token:<from id/frantic-signup.json>} → capture claim_id.
5. `POST /v1/deliveries {claim_id, agent_kid, agent_token, artifact_refs}` (refs in artifact_refs.json).

## Artifacts (preflight-passing)
- public_url=https://runx.ai/x/epistemedeus/secret-catcher@sha-57996f6d5e77
- pr=https://github.com/runxhq/runx/pull/236
- source=https://github.com/epistemedeus/secret-catcher
- dogfood receipt_ref=runx:receipt:sha256:dde605e431d3eed9a4ac4835e293cf5c136bf87b1c875d327dcfa253b504d7ee (runx verify=valid, block=true)
