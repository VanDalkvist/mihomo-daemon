# Adoption / verification ledger

## 2026-11-21 — independent daemon source and public controller API
User requested independent daemon repository and Ultimate dependency while leaving BB unchanged.
LaunchDaemon asset extracted byte-for-byte from bb-plugin-vpn and verified equal to the installed /Library/LaunchDaemons/io.github.metacubex.mihomo.plist.
No live YAML, providers, credential URLs, caches or native binaries were copied into git.
No live daemon files moved or edited, no process restarted, and no second service/config owner installed.

Public entry index.ts exports the transport, connection/error contracts and GET-only readiness checker.
Ultimate VPN pins and actually imports this repository via vpn/dependencies/mihomo-daemon.
Current API checkpoint: 819dfcc (typed ErrorOptions causes and stable root entry).
Independent architecture review in ultimate-vpn/docs/architecture-review.md: CURRENT VERDICT PASS, covering both repositories.
Fresh deterministic tests: 5 passed, 0 failed (Node test runner, bounded 30s per test / 60s suite).
Live readiness used GET /version only and returned 1.19.32.
Parent receipts confirm same process PID/start time, identical live config SHA256 and BB HEAD/worktree unchanged.
Original install/uninstall scripts intentionally not carried over because they kill processes, rewrite TUN and remove runtime cache.
Existing deployment remains authoritative; service management on a new machine remains an explicit native launchctl operation, never an extension side effect.

## Publication privacy audit — 2026-11-21
Inspected every tracked file and all reachable history. Gitleaks current/history scans and personal-metadata/image checks found no issues; 5 daemon tests passed. The plist has generic Homebrew paths, not private configuration. Added ignore rules for local configuration, keys, runtime databases and screenshots. No privacy blocker found for publishing this repository; visibility remains private, and no production source/service/config change was made. See docs/publication-audit.md.
