# Trusted Worker Deployment Requirements

The competitive worker must run outside the browser with privileged database access stored only in server-side environment configuration.

It is responsible for:

1. Sweeping active queue modes.
2. Calling restricted match formation logic.
3. Driving server provisioning requests.
4. Recording validated match results.
5. Triggering rating updates.

The exact runtime provider can be selected independently of the application code. This separation allows the project to move from a local environment to VPS, containers, or managed infrastructure without changing the competitive domain.
