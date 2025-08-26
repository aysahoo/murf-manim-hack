import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata = {
  title: "Mona",
  description: "Mona - AI-powered explanations",
  icons: {
    icon: "/heart-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable}`}>{children}</body>
    </html>
  );
}
