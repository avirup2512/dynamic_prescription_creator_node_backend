import { BaseModel } from "../common/base.model";
import { User } from "../../types/entities";

export class UserModel extends BaseModel<User> {
  constructor() {
    super(
      "users",
      "id",
      ['firstname', 'lastname', 'email', 'is_active'],
      ['firstname', 'lastname', 'email'],
    );
  }
}
