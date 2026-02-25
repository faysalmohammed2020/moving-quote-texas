// types/next-auth.d.ts  (module augmentation)
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "USER" | "ADMIN";
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "USER" | "ADMIN";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
  }
}
