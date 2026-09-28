import { Inter } from "next/font/google";
import "./globals.css";
import Chrome from "../components/Chrome";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TeamSetu — HR Software Your Whole Team Will Love",
  description:
    "TeamSetu brings hiring, onboarding, time off, and performance into one simple HR platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
