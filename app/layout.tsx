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
      <body className="h-dvh overflow-hidden">
        <Suspense>
          <ThemeProvider>
            <TooltipProvider>
              <div className="flex flex-col h-full w-full">
                <TopNav />
                <div className="flex-1 overflow-auto px-4 py-1 flex flex-col">
                  {children}
                </div>
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
