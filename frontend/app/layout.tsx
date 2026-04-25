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
      <body className="bg-bg text-text font-sans antialiased min-h-screen relative">
        {/* Ambient Global Background */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-bg">
           <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen" style={{ animation: "ambient-drift 20s infinite ease-in-out" }}></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/20 rounded-full blur-[140px] mix-blend-screen" style={{ animation: "ambient-drift 25s infinite ease-in-out reverse" }}></div>
           <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-fuchsia-600/20 rounded-full blur-[100px] mix-blend-screen" style={{ animation: "ambient-drift 22s infinite ease-in-out 2s" }}></div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
