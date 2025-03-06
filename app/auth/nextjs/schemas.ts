import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z
  .string()
  .min(6)
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  username: z
  .string()
  .min(3)
  .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric and can include underscores"),

});

