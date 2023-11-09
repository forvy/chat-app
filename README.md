# Chat-app using Mongo, Node, Nextjs
## Getting Started
Copy .env.example to .env and update with your configuration.

Next install dependency for each client, server:
```bash
npm install
```
To run whole app go to each folder example `cd client`, `cd server`:
```bash
npm run start
```

## If using Docker
The services can be run on the background with command:
```bash
docker compose up -d
```

To rebuild after file change:
```bash
docker-compose up --build
```

## Using docker to Stop the System
Stopping all the running containers is also simple with a single command:
```bash
docker compose down
```

If you need to stop and remove all containers, networks, and all images used by any service in <em>docker-compose.yml</em> file, use the command:
```bash
docker compose down --rmi all
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.