import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useDsTheme } from "@/design/themeContext"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// Inside a scope: the Suite's label (text role, block with a small gap).
const themedLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-pl-text mb-1 block"
)

const Label = React.forwardRef(({ className, ...props }, ref) => {
  const variants = useDsTheme() ? themedLabelVariants : labelVariants
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(variants(), className)}
      {...props}
    />
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }