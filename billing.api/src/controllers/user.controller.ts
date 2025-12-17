import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export class UserController {
    login = async (request, reply) => {
        const { email, password } = request.body as any;
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { userId: user.Id, email: user.Email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        reply.send( { token, user });
    }
}