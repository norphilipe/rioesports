# Matchmaking Worker

Match formation is intentionally separated from browser-facing queue operations.

The application can enqueue and dequeue authenticated players through restricted RPCs. A trusted backend worker is responsible for attempting match formation. The worker must use a privileged server-side database client and must never expose service credentials to the browser.

## Initial strategy

- Trigger a formation attempt after queue activity.
- Periodically sweep active queue modes.
- Treat a null match ID as "not enough eligible players yet".
- Persist match lifecycle changes before server assignment.
