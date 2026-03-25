import { fontNormal, fontMonospace } from "@/components/fonts"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Suspense } from "react"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import TopNav from "./menubar/top-nav";
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontNormal.variable, fontMonospace.variable, "font-sans", geist.variable)}
    >
      <body>
        <Suspense>
          <ThemeProvider>
            <TooltipProvider>
              <TopNav />
              <div className="w-full pl-6 pr-6">
                {children}
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
