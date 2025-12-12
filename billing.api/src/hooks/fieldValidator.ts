// validateFields.ts
import { FastifyReply, FastifyRequest } from "fastify";

export function validateFields(fields: string[]) {
  return (req: FastifyRequest, reply: FastifyReply, done: () => void) => {
    for (const field of fields) {
      const value = (req.body as any)?.[field];

      if (value === undefined || value === null || value === "") {
        reply.code(400).send({ error: `${field} is required` });
        return; // Stop execution
      }
    }

    done(); // Continue to handler
  };
}