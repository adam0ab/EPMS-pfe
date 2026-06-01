import { Role } from "@epms/shared";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: Role;
  department?: string;
  isActive?: boolean;
}

export const userService = {
  async list() {
    return userRepository.find({}, { sort: { createdAt: -1 } }).then((users) =>
      users.map((u) => ({
        _id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        department: u.department?.toString(),
        isActive: u.isActive,
        createdAt: u.createdAt,
      }))
    );
  },

  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("A user with this email already exists");

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      department: input.department as never,
    });

    return user;
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.updateById(id, input as never);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async remove(id: string) {
    const user = await userRepository.deleteById(id);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },
};
