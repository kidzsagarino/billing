import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number
      JWT_SECRET: string
      DB_NAME?: string,
      DB_USER?: string,
      DB_PASSWORD?: string,
      DB_HOST?: string,
      DB_PORT?: number
    }
  }
}