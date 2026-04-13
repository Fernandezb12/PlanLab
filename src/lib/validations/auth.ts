import { z } from "zod";

export const educationLevels = [
  "Básica Primaria",
  "Básica Secundaria",
  "Educación Media",
  "Educación Superior",
  "Otro"
] as const;

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "Mínimo 6 caracteres")
});

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Ingresa tu nombre completo"),
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
    mainEducationLevel: z.enum(educationLevels, {
      errorMap: () => ({ message: "Selecciona tu nivel educativo principal" })
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
