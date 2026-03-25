import { Geist, Geist_Mono } from "next/font/google"
//import { Nanum_Gothic_Coding } from "next/font/google";

export const fontNormal = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMonospace = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
