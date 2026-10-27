# Renicode local review — 2026-10-26

## Scope and result

Reviewed the uncommitted fork changes against local HEAD `08ac673ab`, including branding,
desktop profile isolation, migration, portable deployment and launcher, CLI build inputs,
patch permissions, and the improvement plugin. `origin/dev` is not available locally.

No hidden download-and-execute, credential exfiltration, security-product disabling, or
logon persistence was found in the reviewed additions. Credential migration uses the
authenticated local source and destination APIs. Verification commands use the existing
permission-aware Shell tool. The lockfile adds a local workspace plugin and does not
change third-party package versions or integrity hashes.

This is a focused source review, not a full dependency audit, malware clearance, or proof
that the existing binary was built only from these sources in a clean environment.

## Evidence

- Desktop profile, launcher store, settings migration and packaging: 20 tests passed.
- Improvement plugin: 19 tests passed.
- Full `bun run check` stopped in lint: Node 22.16 cannot load the TypeScript oxlint plugin.
- Desktop typecheck stopped on `packages/app/src/custom-elements.d.ts`, a Git symlink
  checked out as its target-path text on Windows. Typechecking did not complete.
- Packaged CLI and deployed slot A CLI matched SHA256 before quarantine:
  `701465411A501AF61C992DA47B82E324FCEEC3BDA085AF698C2D507F20E57386`.
- Desktop `.2` contains CLI `.1`, consistent with the desktop-only build path and the
  launcher's byte-identical-backend update requirement; this is not by itself malicious.
- Defender reported `Trojan:Win32/Filery.I!cl` for the staged CLI. During review it also
  quarantined the packaged CLI (16:30:37 detection) and desktop EXE (16:32:33 detection).

## Signing status

Signing was **not completed**. The source CLI was missing when the signing preflight ran.
No certificate, signed output, trust-store import, security exclusion or quarantine
restoration was performed by this workflow. Existing deployments and their hashes were
not changed.

`script/sign-renicode.ps1` prepares a separate signed portable copy once a new artifact
has been reviewed and the detection has been resolved. It requires the reviewed CLI's
SHA256 and refuses an existing output directory or replacement of an existing signature.
The private key is non-exportable in `Cert:\CurrentUser\My`; only the public certificate
and signing report are included in the output. It does not install a trusted root or
publisher, and does not request an external timestamp.

Example for a **new, reviewed build**, not for restoring the quarantined specimen:

```powershell
.\script\sign-renicode.ps1 `
  -Source .\packages\desktop\dist-renicode\win-unpacked `
  -Output "$env:LOCALAPPDATA\Temp\opencode\renicode-signed\win-unpacked" `
  -ExpectedCliHash '<SHA256 recorded after reviewing the new build>'
```

Self-signing proves neither malware safety nor public publisher reputation. Other machines
will not automatically trust this certificate. Signing changes file hashes; do not overwrite
deployed A/B slots or bypass the launcher's integrity checks. Resolve the antivirus finding
through clean-build comparison and vendor false-positive review before deployment.

## Follow-up — 2026-10-27

- User authorized checking the detections and restoring files if the checks supported it.
- Defender engine `1.1.26090.9`, intelligence `1.461.217.0`, real-time protection enabled.
- Diagnostic custom scans (`-DisableRemediation`, which ignores file exclusions without
  applying detection actions) found no threats in the existing CLI and desktop samples.
  Their SHA256 values matched the recorded Microsoft submissions:
  CLI `701465411a501af61c992da47b82e324fceec3bda085af698c2d507f20e57386`;
  old desktop `dfba63bbb48bdab0a66efddca7ebc6780b10e47540e61997690277da63196e47`.
- Restored only `packages/cli/dist-renicode/cli-windows-x64-baseline/bin/opencode.exe`
  through Defender's exact-file restore command with administrator elevation. Its hash
  matched the reviewed CLI above, and a normal custom scan found no threats afterward.
- Rebuilt the desktop-only portable package with the existing Electron `44.9.1`
  distribution and unchanged CLI. Scans of both the entire package and copied B slot
  found no threats. No exclusions, threat allow rules, protection disabling, signing,
  certificate trust imports, or additional sample uploads were performed.
- The focused packaging/lifecycle/lockfile source review found no suspicious new behavior;
  this remains a limited review, not a full binary or dependency audit. Today's clean
  scans support a resolved/suspected false positive, not absolute malware clearance.
  Microsoft's analyst determination has not been rechecked.
- Isolated packaged startup passed IPC, renderer and authenticated backend readiness,
  15-second healthy observation, and normal-exit reporting. Evidence:
  `%LOCALAPPDATA%/Temp/opencode/renicode-smoke-jXBi18/` (including `screenshot.png`).
- New sidebar package staged as pending B, leaving active A and its guardian untouched:
  `%LOCALAPPDATA%/RenicodePortable/slots/B/947119bd-fd7c-404f-9c0d-4c75b8195554/`.
  New desktop EXE SHA256:
  `7e13a58898815077dfb58979aa33652c4e9b8acbdb03b17994ad01523991a944`;
  `resources/app.asar` SHA256:
  `3f54a91ef4d190e634f693ade5d205eb9a447470c4ff38ae78ca2f6a3f0fe14d`.
  Desktop version is `.2`; the slot's `.1` version field tracks its unchanged backend.
  Live-profile promotion remains deferred until normal exit and launcher health checks.
