# secret-catcher — bounty delivery report

Bounty: Frantic #92 — runx skill: secret-catcher ($8). A published, installable runx skill that scans a code diff for credential-like
spans and returns redacted findings, a gated redaction proposal, and a block decision — without ever
quoting a raw secret.

## Evidence

- **Package**: `epistemedeus/secret-catcher@sha-57996f6d5e77` — published to the runx registry via `runx login --provider github --for publish; runx registry publish ./skills/secret-catcher/SKILL.md --registry https://api.runx.ai`.
- **runx CLI**: `runx-cli 0.6.14` for every publish/install/dogfood/verify step.
- **Public URL**: https://runx.ai/x/epistemedeus/secret-catcher
- **Source**: https://github.com/epistemedeus/secret-catcher/tree/be0b54e2bd006fcc17f613153c5ec39d9b3b21d5
- **PR**: https://github.com/runxhq/runx/pull/236 (head `d484d2fa1784ec77be6d15176366544ff223c74a`) adds `skills/secret-catcher/{X.yaml,SKILL.md,run.mjs,fixtures}`; raw [X.yaml](https://raw.githubusercontent.com/epistemedeus/runx/d484d2fa1784ec77be6d15176366544ff223c74a/skills/secret-catcher/X.yaml) and [SKILL.md](https://raw.githubusercontent.com/epistemedeus/runx/d484d2fa1784ec77be6d15176366544ff223c74a/skills/secret-catcher/SKILL.md) are fetchable from the head commit.
- **Install**: `runx add epistemedeus/secret-catcher@sha-57996f6d5e77 --registry https://api.runx.ai`
- **Local harness**: passed (3/3, 0 assertion errors) — cases `planted-secret-blocks` (sealed) and `clean-diff-does-not-block` (sealed) and `refuses-to-apply-redaction` (failure); the planted-secret case blocks, the clean case does not.
- **Hosted harness**: green — the registry publish gate runs the hosted harness and requires a stop/error case; the refuses-to-apply-redaction case satisfies it.
- **Dogfood**: `runx skill epistemedeus/secret-catcher@sha-57996f6d5e77 --registry https://api.runx.ai --input-json diff='<planted diff>' --input-json scan_context='{"repo":"acme/api","pr":101}' --receipt-dir <dir> -j` sealed receipt `runx:receipt:sha256:dde605e431d3eed9a4ac4835e293cf5c136bf87b1c875d327dcfa253b504d7ee`; `runx verify --receipt receipt.json --json` → **valid**.
- **Block decision**: the dogfood input adds a credential, so `block=true` with finding types [aws_access_key_id, aws_secret_access_key].
- **No leakage**: findings carry redacted previews + SHA-256 fingerprints only; no raw secret appears in the receipt or evidence.
- **Gated redaction**: `redaction_proposal.performed_by = redact-pii`, `requires_approval = true`; secret-catcher edits no files.
- **Verify it yourself**: install, run the dogfood command, then `runx verify --receipt receipt.json --json` with the public key in [verification.json](https://raw.githubusercontent.com/epistemedeus/secret-catcher/master/delivery/verification.json).

## How a new user adopts it

1. `runx add epistemedeus/secret-catcher@sha-57996f6d5e77 --registry https://api.runx.ai`
2. `runx skill epistemedeus/secret-catcher@sha-57996f6d5e77 --registry https://api.runx.ai --input-json diff='<planted diff>' --input-json scan_context='{"repo":"acme/api","pr":101}' --receipt-dir <dir> -j`
3. `runx verify --receipt receipt.json --json` (public key in verification.json) → valid.

