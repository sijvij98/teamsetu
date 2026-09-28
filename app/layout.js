import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Chrome from "../components/Chrome";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata = {
  title: "TeamSetu — HR Software Your Whole Team Will Love",
  description:
    "TeamSetu brings hiring, onboarding, time off, and performance into one simple HR platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
