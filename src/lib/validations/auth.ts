import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "Mínimo 6 caracteres")
});

export type AuthInput = z.infer<typeof authSchema>;
