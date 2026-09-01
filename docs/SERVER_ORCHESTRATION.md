# Server Orchestration Boundary

RIO ESPORTS separates competitive application logic from dedicated server provisioning.

The application owns:

- Match creation
- Match lifecycle
- Player assignment
- Server state
- Connection endpoint persistence

The infrastructure worker owns:

- Provisioning a dedicated CS2 server
- Applying the approved competitive configuration
- Returning a connection endpoint
- Health checks and cleanup

The infrastructure provider remains intentionally decoupled so local, VPS, container, or managed hosting can be introduced without changing matchmaking rules.
