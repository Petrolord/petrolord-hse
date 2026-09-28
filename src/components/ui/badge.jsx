import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useDsTheme } from "@/design/themeContext"

// Legacy variants (outside a scope, byte for byte as before).
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Inside a scope: the Suite's roles. The status variants (success, warning,
// danger, info) are the one place colour carries meaning; use them for
// status only. `neutral` is for counts and tags, `selected` for the chosen
// chip in a set.
const themedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pl-focus focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-pl-primary text-pl-primary-fg",
        secondary: "border-transparent bg-pl-sunken text-pl-text",
        destructive: "border-transparent bg-pl-danger text-pl-danger-fg",
        outline: "border-pl-border-strong text-pl-text",
        accent: "border-transparent bg-pl-accent text-pl-accent-fg",
        success: "border-transparent bg-pl-success-bg text-pl-success-text",
        warning: "border-transparent bg-pl-warning-bg text-pl-warning-text",
        danger: "border-transparent bg-pl-danger-bg text-pl-danger-text",
        info: "border-transparent bg-pl-info-bg text-pl-info-text",
        neutral: "border-pl-border bg-pl-sunken text-pl-muted",
        selected: "border-pl-primary bg-pl-primary/10 text-pl-primary-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  const variants = useDsTheme() ? themedBadgeVariants : badgeVariants
  return (
    <div className={cn(variants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants, themedBadgeVariants }