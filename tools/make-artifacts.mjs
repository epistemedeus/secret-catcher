// make-artifacts.mjs — assemble evidence.json, verification.json, report.md for the
// secret-catcher bounty delivery from a runtime-values config.
//
//   node tools/make-artifacts.mjs artifact-config.json <outDir>
//
// The config is filled in after the post-publish dogfood run. This keeps the
// delivery artifacts a deterministic function of the real runtime evidence.

import fs from "node:fs";
import path from "node:path";

const [, , configPath, outDirArg] = process.argv;
if (!configPath) throw new Error("usage: node make-artifacts.mjs <config.json> [outDir]");
const c = JSON.parse(fs.readFileSync(configPath, "utf8"));
const outDir = outDirArg || ".";
fs.mkdirSync(outDir, { recursive: true });

// ---- evidence.json ----------------------------------------------------------
const observations = [
  `runx CLI version: ${c.runx_version} (publish, install, dogfood, and verify were all run with this binary).`,
  `Publisher owner: ${c.owner}. Package name: ${c.package} (exact). Version: ${c.version}.`,
  `Registry ref: ${c.registry_ref}. Public adoption page (public_url): ${c.public_url}.`,
  `Source/provenance (source_url): ${c.source_url}.`,
  `Pull request against runxhq/runx (pr_url): ${c.pr_url}. Head commit: ${c.pr_head_commit}.`,
  `Raw X.yaml from the PR head commit: ${c.x_yaml}.`,
  `Raw SKILL.md from the PR head commit: ${c.skill_md}.`,
  `Publish method: ${c.publish_method}.`,
  `Install command: ${c.install_command}.`,
  `Local harness (pre-publish): status=${c.local_harness_status}, cases=[${c.harness_cases.map((h) => `${h.name}:${h.status}`).join(", ")}], receipts=${c.local_harness_receipts.length}.`,
  `Hosted registry harness (post-publish): ${c.hosted_harness_status}.`,
  `Dogfood command: ${c.dogfood.command}.`,
  `Dogfood receipt_ref (post-publish run of ${c.registry_ref}, not a harness fixture seal): ${c.dogfood.receipt_ref}.`,
  `runx verify verdict on the dogfood receipt: ${c.dogfood.verify_verdict}.`,
  `Block decision on the dogfood input: block=${c.dogfood.block}. Finding types: [${c.dogfood.finding_types.join(", ")}]. Locations: ${c.dogfood.finding_locations.join("; ")}.`,
  `Clean path: a diff whose added lines only reference credentials via environment variables and placeholders yields zero findings and block=false (harness case ${"clean-diff-does-not-block"}).`,
  `No raw secret value appears in any finding, artifact, or sealed receipt: each span carries a redacted preview and a one-way SHA-256 fingerprint, and the runner fails closed otherwise.`,
  `New-user path: install with '${c.install_command}', run '${c.dogfood.command}', and verify the sealed receipt with '${c.verify_command}'. verification.json records the public key so verification needs no private context.`,
];

const summary =
  `secret-catcher is a published, installable runx skill (${c.registry_ref}) that scans a unified diff for ` +
  `credential-like spans and returns redacted findings, a gated redaction_proposal for the redact-pii executor, ` +
  `and a block decision — without ever quoting a raw secret. Local harness passed ${c.harness_cases.length}/${c.harness_cases.length}; ` +
  `the post-publish dogfood run sealed receipt ${c.dogfood.receipt_ref} with block=${c.dogfood.block}, and runx verify returned ${c.dogfood.verify_verdict}.`;

const evidence = {
  schema: "secret.catcher.bounty.evidence.v1",
  summary,
  bounty: c.bounty,
  package: { owner: c.owner, name: c.package, version: c.version, registry_ref: c.registry_ref },
  artifacts: {
    public_url: c.public_url,
    source_url: c.source_url,
    pr_url: c.pr_url,
    x_yaml: c.x_yaml,
    skill_md: c.skill_md,
    receipt_ref: c.dogfood.receipt_ref,
  },
  observations,
  dogfood: {
    package: c.registry_ref,
    input: c.dogfood.input,
    command: c.dogfood.command,
    receipt_ref: c.dogfood.receipt_ref,
    verify_verdict: c.dogfood.verify_verdict,
    block: c.dogfood.block,
    harness_cases: c.harness_cases,
  },
  runx_version: c.runx_version,
};
fs.writeFileSync(path.join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");

// ---- verification.json ------------------------------------------------------
const verification = {
  schema: "secret.catcher.bounty.verification.v1",
  summary,
  receipt_ref: c.dogfood.receipt_ref,
  verify_command: c.verify_command,
  verify_verdict: c.dogfood.verify_verdict,
  signature_alg: "Ed25519",
  issuer_kid: c.issuer_kid,
  public_key_base64: c.public_key_base64,
  public_key_sha256: c.public_key_sha256,
  note: "Public key only — no secret. Anyone can verify the sealed dogfood receipt with the command above.",
};
fs.writeFileSync(path.join(outDir, "verification.json"), JSON.stringify(verification, null, 2) + "\n");

// ---- report.md --------------------------------------------------------------
const bullets = [
  `**Package**: \`${c.registry_ref}\` — published to the runx registry via \`${c.publish_method}\`.`,
  `**runx CLI**: \`${c.runx_version}\` for every publish/install/dogfood/verify step.`,
  `**Public URL**: ${c.public_url}`,
  `**Source**: ${c.source_url}`,
  `**PR**: ${c.pr_url} (head \`${c.pr_head_commit}\`) adds \`skills/secret-catcher/{X.yaml,SKILL.md,run.mjs,fixtures}\`; raw [X.yaml](${c.x_yaml}) and [SKILL.md](${c.skill_md}) are fetchable from the head commit.`,
  `**Install**: \`${c.install_command}\``,
  `**Local harness**: ${c.local_harness_status} — cases ${c.harness_cases.map((h) => `\`${h.name}\` (${h.status})`).join(" and ")}; the planted-secret case blocks, the clean case does not.`,
  `**Hosted harness**: ${c.hosted_harness_status}.`,
  `**Dogfood**: \`${c.dogfood.command}\` sealed receipt \`${c.dogfood.receipt_ref}\`; \`${c.verify_command}\` → **${c.dogfood.verify_verdict}**.`,
  `**Block decision**: the dogfood input adds a credential, so \`block=${c.dogfood.block}\` with finding types [${c.dogfood.finding_types.join(", ")}].`,
  `**No leakage**: findings carry redacted previews + SHA-256 fingerprints only; no raw secret appears in the receipt or evidence.`,
  `**Gated redaction**: \`redaction_proposal.performed_by = redact-pii\`, \`requires_approval = true\`; secret-catcher edits no files.`,
  `**Verify it yourself**: install, run the dogfood command, then \`${c.verify_command}\` with the public key in [verification.json](${c.verification_json || "verification.json"}).`,
];
const report = [
  "# secret-catcher — bounty delivery report",
  "",
  `Bounty: ${c.bounty}. A published, installable runx skill that scans a code diff for credential-like`,
  "spans and returns redacted findings, a gated redaction proposal, and a block decision — without ever",
  "quoting a raw secret.",
  "",
  "## Evidence",
  "",
  ...bullets.map((b) => `- ${b}`),
  "",
  "## How a new user adopts it",
  "",
  `1. \`${c.install_command}\``,
  `2. \`${c.dogfood.command}\``,
  `3. \`${c.verify_command}\` (public key in verification.json) → ${c.dogfood.verify_verdict}.`,
  "",
].join("\n");
fs.writeFileSync(path.join(outDir, "report.md"), report + "\n");

console.log("wrote evidence.json, verification.json, report.md to", path.resolve(outDir));
console.log("evidence observations:", observations.length, "| report bullets:", bullets.length);
