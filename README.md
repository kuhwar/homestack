# Homestack

Web UI for Docker Engine on headless Linux servers. Homestack provides hobbyists and self-hosters with an intuitive interface to manage containerized applications without command-line access.

## Features

- View all Docker containers with status, image, and ID
- Real-time connection to Docker Engine via docker.sock
- Clean, responsive UI built with Tailwind CSS
- Server-side rendering with Handlebars templates
- Runs as a Docker container itself

## Prerequisites

- Node.js 18.0.0 or higher
- Docker Engine
- Access to `/var/run/docker.sock`

## Quick Start

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/kuhwar/homestack.git
   cd homestack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://127.0.0.1:3000 in your browser

### Production (Docker)

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Run the container:
   ```bash
   npm run docker:run
   ```

   Or using docker-compose:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

3. Open http://127.0.0.1:3000 in your browser

## Project Structure

```
homestack/
├── src/
│   ├── index.ts          # Application entry point
│   ├── app.ts            # Express app configuration
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic (Docker service)
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── views/
│   ├── layouts/          # Handlebars layouts
│   ├── partials/         # Reusable template partials
│   └── home.hbs          # Home page template
├── public/               # Static assets
├── styles/               # Tailwind CSS source
├── docker/               # Docker configuration
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **Handlebars** - Server-side templating
- **Tailwind CSS** - Utility-first CSS
- **Dockerode** - Docker API client

## Security

Homestack binds to `127.0.0.1` by default for security. When running in Docker, the container binds to `0.0.0.0` internally but the host port is bound to `127.0.0.1`.

The Docker socket is mounted read-only (`:ro`) in the docker-compose configuration.

## License

MIT
