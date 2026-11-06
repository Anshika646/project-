import { Profile, Institution, UserRole } from './database.types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile;
  institution: Institution;
}

export interface DemoAccount {
  id: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  name: string;
  avatar: string;
  badge: string;
  description: string;
}
