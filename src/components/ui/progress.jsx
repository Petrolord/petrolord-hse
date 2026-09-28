import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

// Inside a design-system scope: the Suite's hairline track and primary fill.
const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        tc("relative h-4 w-full overflow-hidden rounded-full bg-secondary", "relative h-4 w-full overflow-hidden rounded-full bg-pl-border"),
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(tc("h-full w-full flex-1 bg-primary transition-all", "h-full w-full flex-1 bg-pl-primary transition-all"), indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }