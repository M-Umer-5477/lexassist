import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "LexAssist — AI-Powered Legal Document Assistant",
  description:
    "Upload legal documents and ask questions in plain English. Get accurate answers with source citations, powered by RAG technology.",
  keywords: [
    "legal AI",
    "document assistant",
    "RAG",
    "contract analysis",
    "legal tech",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
