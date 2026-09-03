/**
 * @oyinlola141/lattice-cli — Infrastructure Generator
 *
 * Generates Docker, docker-compose, and database infrastructure files.
 */

import { writeFileTree } from "../../utils/utils.fileSystem.js";

export interface InfrastructureOptions {
  readonly projectName: string;
  readonly architecture: string;
  readonly database: string;
  readonly packageManager: string;
  readonly services?: readonly string[];
}

export class InfrastructureGenerator {
  async generate(
    options: InfrastructureOptions,
    basePath: string,
  ): Promise<void> {
    const files = this.getFiles(options);
    await writeFileTree(basePath, files);
  }

  private getFiles(options: InfrastructureOptions): Record<string, string> {
    const files: Record<string, string> = {};

    if (options.architecture === "microservice") {
      files["docker-compose.yml"] = this.getDockerCompose(options);
      files[".dockerignore"] = "node_modules\ndist\n.git\n.env\n";

      const services = options.services ?? ["gateway"];
      for (const service of services) {
        files[`apps/${service}/Dockerfile`] = this.getServiceDockerfile(options);
      }
    } else {
      files["docker-compose.yml"] = this.getSimpleDockerCompose(options);
      files[".dockerignore"] = "node_modules\ndist\n.git\n.env\n";
      files["Dockerfile"] = this.getAppDockerfile(options);
    }

    files["migrations/.gitkeep"] = "";

    return files;
  }

  private getAppDockerfile(
    options: InfrastructureOptions,
  ): string {
    return `FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN ${options.packageManager === "pnpm" ? "pnpm" : options.packageManager === "yarn" ? "yarn" : "npm"} install --frozen-lockfile
COPY . .
RUN ${options.packageManager === "pnpm" ? "pnpm" : options.packageManager === "yarn" ? "yarn" : "npm"} run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
`;
  }

  private getServiceDockerfile(
    options: InfrastructureOptions,
  ): string {
    return `FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN ${options.packageManager === "pnpm" ? "pnpm" : options.packageManager === "yarn" ? "yarn" : "npm"} install --frozen-lockfile
COPY . .
RUN ${options.packageManager === "pnpm" ? "pnpm" : options.packageManager === "yarn" ? "yarn" : "npm"} run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
`;
  }

  private getSimpleDockerCompose(
    options: InfrastructureOptions,
  ): string {
    const dbImage =
      options.database === "postgresql"
        ? "postgres:16-alpine"
        : options.database === "mysql"
          ? "mysql:8"
          : "alpine:latest";

    return `version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${options.projectName}
    depends_on:
      - db
    develop:
      watch:
        - path: src/
          action: sync
          target: /app/src

  db:
    image: ${dbImage}
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${options.projectName}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
`;
  }

  private getDockerCompose(
    options: InfrastructureOptions,
  ): string {
    const services = options.services ?? ["gateway"];
    const dbImage =
      options.database === "postgresql"
        ? "postgres:16-alpine"
        : options.database === "mysql"
          ? "mysql:8"
          : "alpine:latest";

    let serviceDefs = "";

    for (const service of services) {
      serviceDefs += `
  ${service}:
    build:
      context: apps/${service}
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/${options.projectName}
    depends_on:
      - db
`;
    }

    return `version: "3.8"
services:${serviceDefs}
  db:
    image: ${dbImage}
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${options.projectName}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
`;
  }
}
