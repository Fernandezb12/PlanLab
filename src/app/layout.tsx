import type { Metadata } from "next";

import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PlanLab",
  description: "Suite docente para planificación, actividades, resultados y reportes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
