import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/User";

export class UserController {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }
  // LOGIN user
  login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = request.body as { email: string; password: string };

      if (!email || !password) {
        return reply.status(400).send({ message: "Email and password are required" });
      }

      const user = await User.findOne({ where: { Email: email } });
      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch) {
        return reply.status(401).send({ message: "Invalid password" });
      }

      const token = this.fastify.jwt.sign({ userId: user.Id, email: user.Email, role: user.Role });

      reply.code(200).send({
        token,
        user: {
          Id: user.Id,
          Username: user.Username,
          Email: user.Email,
          Role: user.Role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      reply.status(500).send({ message: "Internal server error" });
    }
  };

  // REGISTER new user
  register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, username, role } = request.body as {
        email: string;
        password: string;
        username: string;
        role: number;
      };

      if (!email || !password || !username) {
        return reply.status(400).send({ message: "Email, username and password are required" });
      }

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
        Role: role ?? 1, // default role if not provided
      });

      reply.code(201).send({
        Id: newUser.Id,
        Email: newUser.Email,
        Username: newUser.Username,
        Role: newUser.Role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      reply.status(500).send({ message: "Internal server error" });
    }
  };
}
