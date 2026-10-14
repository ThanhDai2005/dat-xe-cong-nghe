import type { RowDataPacket } from "mysql2";

export interface UserRow extends RowDataPacket {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
}

export function publicUser(user: UserRow) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
}
