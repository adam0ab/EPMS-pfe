import { AuditAction } from "@epms/shared";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { auditService } from "./audit.service";

export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });
    await auditService.log(user._id.toString(), AuditAction.LOGIN, "User", user._id.toString());

    return {
      token,
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department?.toString(),
        isActive: user.isActive,
      },
    };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department?.toString(),
      isActive: user.isActive,
    };
  },
};
