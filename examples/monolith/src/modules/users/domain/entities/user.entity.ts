import { Entity } from "../../../../shared/domain/entity.js";
import type { UserId } from "../../../../shared/domain/ids.js";

export enum UserRole { ADMIN = "admin", MEMBER = "member" }

export class User extends Entity<UserId> {
  private _email: string;
  private _name: string;
  private _passwordHash: string;
  private _role: UserRole;

  private constructor(id: UserId, email: string, name: string, passwordHash: string, role: UserRole, createdAt?: Date) {
    super(id, createdAt);
    this._email = email;
    this._name = name;
    this._passwordHash = passwordHash;
    this._role = role;
  }

  public static create(id: UserId, email: string, name: string, passwordHash: string, role: UserRole = UserRole.MEMBER): User {
    if (!email.includes("@")) throw new Error("Invalid email.");
    if (name.trim().length === 0) throw new Error("Name cannot be empty.");
    return new User(id, email, name, passwordHash, role);
  }

  public get email(): string { return this._email; }
  public get name(): string { return this._name; }
  public get role(): UserRole { return this._role; }
  public get passwordHash(): string { return this._passwordHash; }
}
