import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"

const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono" })
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "SkillForge AI",
  description: "From resume claims to real capability.",
  colorScheme: "dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexMono.variable} ${plexSans.variable}`}>
      <body className="bg-bg text-text font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
