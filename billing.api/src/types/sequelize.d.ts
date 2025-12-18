import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      [key: string]: any;
      PORT: number;
      JWT_SECRET: string;
      DB_NAME: string;
      DB_PORT: number;
    };
  }
}