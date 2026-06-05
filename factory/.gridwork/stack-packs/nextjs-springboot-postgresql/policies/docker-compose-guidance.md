# Docker Compose Guidance

Docker Compose is recommended for local development when the project uses PostgreSQL, but this stack pack does not generate compose files.

Review existing compose files for:

- PostgreSQL service healthchecks;
- environment examples without secrets;
- migration flow;
- network and port clarity;
- dev/prod separation.

