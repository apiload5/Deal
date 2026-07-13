import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: './schema.prisma',
  migrate: {
    connectionString: process.env.DATABASE_URL
  },
  seed: {
    // Prisma 7 me direct command dena hai
    command: 'tsx prisma/seed.ts'
  }
})
