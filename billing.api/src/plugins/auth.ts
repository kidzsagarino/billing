import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: any; 
    jwtVerify(): Promise<void>;
  }
}

async function authPluginRaw(fastify: FastifyInstance) {
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
        try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ message: 'Invalid or expired token' });
      }
    }
  );
}

export const authPlugin = fp(authPluginRaw);