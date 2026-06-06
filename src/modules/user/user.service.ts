import { BaseService } from "../common/base.service";
import { UserModel } from "./user.model";
import { User } from "../../types/entities";

export class UserService extends BaseService<User> {
  constructor() {
    super(new UserModel());
  }
}

export default new UserService();
