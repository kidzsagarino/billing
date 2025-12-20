import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

export default async function userRoutes(fastify: FastifyInstance) {
    const controller = new UserController(fastify);

    fastify.post('/login', controller.login);
    fastify.post('/register', controller.register);
}