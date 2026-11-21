# mihomo-daemon

Independent source of the existing Mihomo service definition and controller connection/client.
Read applicable parent AGENTS.md when present. No code in this repository may automatically stop/restart/install/reconfigure a daemon.
The existing BB plugin remains untouched and retains its old independent implementation.
Keep live config, subscription URLs, databases and binaries OUT of git. Credentials only in ~/Projects/.env.
Runtime probes are GET-only; UI consumers explicitly own any runtime mutations.
Tests use scripted loopback servers. Native node:test, Node >=26, no third-party production dependency.
Follow workspace arch rules and independent review gates. main plus annotated checkpoint; the source repository is public. Never publish working configuration or credentials.
