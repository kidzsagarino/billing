import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/User";

export class UserController {
  constructor(private fastify: FastifyInstance) {}

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as any;
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid password" });
    }

    const token = this.fastify.jwt.sign({ userId: user.Id, email: user.Email });
    reply.send({ token, user });
  };

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, username, role } = request.body as any;
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return reply.status(409).send({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      Id: crypto.randomUUID(),
      Email: email,
      PasswordHash: passwordHash,
      Username: username,
      Role: role,
    });

    reply.send(newUser);
  };
}
