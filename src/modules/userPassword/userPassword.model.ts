import { BaseModel } from "../common/base.model";
import { UserPassword } from "../../types/entities";

export class UserPasswordModel extends BaseModel<UserPassword> {
  constructor() {
    super(
      "user_passwords",
      "id",
      ['user_id', 'password'],
      ['password'],
    );
  }
}
