# Current Development Blockers

## No architectural blocker

The competitive application can continue evolving without an immediate product decision.

## External integration requirements

The following items require infrastructure or credentials before live production operation:

- FACEIT live synchronization requires `FACEIT_DATA_API_KEY`.
- Dedicated CS2 server orchestration requires an execution environment for SteamCMD/CS2 instances.
- Automated production match formation requires a trusted scheduled or event-driven worker.

These are integration boundaries rather than reasons to stop core application development.
