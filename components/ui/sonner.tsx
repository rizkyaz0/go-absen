"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      offset="20px"
      gap={12}
      toastOptions={{
        className: "shadow-xl border-0 rounded-xl max-w-sm sm:max-w-md w-full mx-4",
        style: {
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        },
        duration: 4000,
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.95)",
          "--normal-text": "hsl(222.2, 84%, 4.9%)",
          "--normal-border": "hsl(214.3, 31.8%, 91.4%)",
          "--success-bg": "rgba(34, 197, 94, 0.95)",
          "--success-text": "hsl(355, 7%, 97%)",
          "--success-border": "hsl(142, 76%, 36%)",
          "--error-bg": "rgba(239, 68, 68, 0.95)",
          "--error-text": "hsl(355, 7%, 97%)",
          "--error-border": "hsl(0, 84%, 60%)",
          "--warning-bg": "rgba(245, 158, 11, 0.95)",
          "--warning-text": "hsl(355, 7%, 97%)",
          "--warning-border": "hsl(38, 92%, 50%)",
          "--info-bg": "rgba(59, 130, 246, 0.95)",
          "--info-text": "hsl(355, 7%, 97%)",
          "--info-border": "hsl(221, 83%, 53%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
