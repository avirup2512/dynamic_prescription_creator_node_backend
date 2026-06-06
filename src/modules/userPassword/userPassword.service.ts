import { BaseService } from "../common/base.service";
import { UserPasswordModel } from "./userPassword.model";
import { UserPassword } from "../../types/entities";

export class UserPasswordService extends BaseService<UserPassword> {
  constructor() {
    super(new UserPasswordModel());
  }
}

export default new UserPasswordService();
