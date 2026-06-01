import { UserDocument, UserModel } from "../models/User.model";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(UserModel);
  }

  findByEmail(email: string) {
    return this.model.findOne({ email: email.toLowerCase() });
  }
}

export const userRepository = new UserRepository();
