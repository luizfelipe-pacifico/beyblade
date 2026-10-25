import { defineConfig } from 'prisma/config';

// Node nativo em vez de dotenv (CLAUDE.md: preferir recursos nativos). Sem .env, usa o ambiente.
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
