import * as React from "react"
import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

// Legacy strings outside a scope (byte for byte); the Suite's roles inside.
const Card = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <div
      ref={ref}
      className={cn(
        tc("rounded-lg border bg-card text-card-foreground shadow-sm", "rounded-lg border border-pl-border bg-pl-surface text-pl-text shadow-pl-sm"),
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <h3
      ref={ref}
      className={cn(
        tc("text-2xl font-semibold leading-none tracking-tight", "text-lg font-semibold leading-none tracking-tight"),
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <p
      ref={ref}
      className={cn(tc("text-sm text-muted-foreground", "text-sm text-pl-muted"), className)}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }