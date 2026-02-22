"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = React.useCallback(
    (nextTheme: string) => {
      setTheme(nextTheme)
    },
    [setTheme]
  )

  const MoonIcon = (
    <Moon
      className={`h-[1.2rem] w-[1.2rem] scale-${
        theme === "dark" ? "100" : "0"
      } transition-all dark:scale-${
        theme === "dark" ? "100" : "0"
      }`}
    />
  )

  const SunIcon = (
    <Sun
      className={`h-[1.2rem] w-[1.2rem] scale-${
        theme === "dark" ? "0" : "100"
      } rotate-${theme === "dark" ? "-90" : "0"} transition-all dark:scale-${
        theme === "dark" ? "100" : "0"
      } dark:-rotate-${theme === "dark" ? "0" : "90"}`}
    />
  )

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className=""
        onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? MoonIcon : SunIcon}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}
