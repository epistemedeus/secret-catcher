# secret-catcher

A [runx](https://runx.ai) skill that scans a code diff for credential-like
spans and returns redacted findings, a gated redaction proposal, and a `block`
decision — without ever quoting a raw secret.

- **Read-only and offline.** No network, no file edits, no code execution.
- **Grounded in the diff.** Only added lines are scanned; context and removed
  lines are ignored.
- **Never leaks.** Each finding carries a redacted preview and a one-way
  SHA-256 fingerprint. The runner fails closed rather than emit a raw value.
- **Gated redaction.** Redaction is proposed for the downstream `redact-pii`
  executor; this skill edits nothing.

## Layout

```
skills/secret-catcher/
  SKILL.md      # skill card and full documentation
  X.yaml        # execution profile, policy, and typed inputs/outputs
  run.mjs       # dependency-free Node scanner
  fixtures/
    planted-secret-blocks.yaml       # a diff with a planted secret -> block: true
    clean-diff-does-not-block.yaml    # a clean diff -> zero findings, block: false
```

## Install and run

```bash
runx add epistemedeus/secret-catcher@0.1.0
runx skill epistemedeus/secret-catcher@0.1.0 --input-json diff='"<unified diff>"' --json
```

## Local harness

```bash
runx harness ./skills/secret-catcher
```

Two cases seal: `planted-secret-blocks` (findings, `block: true`) and
`clean-diff-does-not-block` (zero findings, `block: false`).

The authoritative harness cases are declared inline in `X.yaml` under
`harness.cases` (this is what `runx harness <skill-dir>` runs). The files in
`fixtures/` mirror those same two cases so they can also be run individually
with `runx harness ./skills/secret-catcher/fixtures/<case>.yaml`; keep the two
in sync when editing.

## About the test fixtures

The planted-secret fixture uses AWS's **documented example credentials**
(`AKIAIOSFODNN7EXAMPLE` and `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`, published
throughout AWS's own documentation and recognized by secret scanners as
examples) plus a **synthetic, non-functional** `ghp_` token. These are test
vectors that exercise the detectors; none is a live credential.

## License

MIT — see [LICENSE](LICENSE).
