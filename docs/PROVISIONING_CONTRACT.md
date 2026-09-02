# Dedicated Server Provisioning Contract

The competitive application depends on a provider-neutral server provisioner.

## Provision input

- Match identifier
- Requested region

## Provision output

- Match identifier
- Lifecycle status
- Connection endpoint when ready

A real provider adapter can target a VPS, container orchestration platform, or another dedicated game-server runtime. The application domain does not expose infrastructure credentials to browser clients.

No provider adapter is considered production-complete until a real CS2 execution environment is available for validation.
