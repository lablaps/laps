import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAPS - Laboratório de Aquisição e Processamento de Sinais",
  description: "Desenvolvendo tecnologias inovadoras em processamento de sinais e inteligência artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif'
        }}
      >
        {children}
      </body>
    </html>
  );
}
