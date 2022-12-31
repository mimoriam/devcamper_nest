import { RoleType } from '../../users/entities/user.entity';

export interface ActiveUserData {
  // The subject of the token or userId:
  sub: number | string;

  email: string;

  role: RoleType;
}
