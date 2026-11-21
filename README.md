# Mihomo daemon

Standalone ownership of the existing Mihomo LaunchDaemon definition and a bounded, server-only controller client.
The native Mihomo binary is upstream software, not reimplemented or copied here.

## Existing installation
- Binary: /opt/homebrew/bin/mihomo (Homebrew).
- LaunchDaemon: io.github.metacubex.mihomo; source in launchd/.
- Runtime configuration/providers/cache remain /opt/homebrew/etc/mihomo.
- Loopback controller: http://127.0.0.1:9090; manual selector PROXY.
- Adoption is non-disruptive: no service restart, config rewrite, file relocation or cache deletion.
- Existing BB extension retains its previous code, paths and lifecycle. Ultimate uses this repository as a pinned submodule dependency, not the BB plugin.

## Controller library
src/connection.ts loads only MIHOMO_API_URL, MIHOMO_API_SECRET, MIHOMO_PROXY_GROUP from ~/Projects/.env.
src/client.ts provides bounded abortable HTTP transport with redirects denied and sanitized errors.
src/runtime.ts checks the existing daemon read-only. src/contracts.ts carries connection/error contracts.
Consumers call the library from their server; no API secret or raw configuration enters browser responses.

## Service source
launchd/io.github.metacubex.mihomo.plist is extracted byte-for-byte from the existing BB service asset.
Do not run the old BB install/uninstall scripts as part of installing Ultimate: they stop processes, edit TUN and remove cache.
There is intentionally no automatic installer or service supervisor here. On another machine install official Mihomo via Homebrew, supply a private config and explicitly review/adapt the plist before using native launchctl.
No live YAML/subscriptions, credential URLs or native binaries are committed.

## Checks
Node 26+. npm test. node scripts/check.ts performs a GET-only readiness check.
