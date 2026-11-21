# Adoption / verification ledger

2026-11-21: operator requested independent daemon repository and Ultimate dependency while leaving BB unchanged.
No live daemon files moved or edited. Extract launchd asset from bb-plugin-vpn, transport/connection from new ultimate-vpn skeleton.
Existing deployment remains authoritative; no second service or config owner is installed.
Plan: test transport/config/readiness, pin this repo as ultimate-vpn/dependencies/mihomo-daemon, import transport from that dependency, verify GET-only install and unchanged service/config.
