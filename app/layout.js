import "./globals.css";
import MaiusculasGlobais from "../components/MaiusculasGlobais";

export const metadata = {
  title: "MENZO — SUAS FINANÇAS, SEU FUTURO.",
  description: "Controle de contas, vencimentos e comprovantes",
  icons: {
    icon: "/favicon-32.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink font-body min-h-screen">
        <MaiusculasGlobais />
        {children}
      </body>
    </html>
  );
}
