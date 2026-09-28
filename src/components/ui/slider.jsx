import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

// Inside a design-system scope: the Suite's track, range and thumb.
const Slider = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}>
      <SliderPrimitive.Track
        className={tc("relative h-2 w-full grow overflow-hidden rounded-full bg-secondary", "relative h-2 w-full grow overflow-hidden rounded-full bg-pl-border")}>
        <SliderPrimitive.Range className={tc("absolute h-full bg-primary", "absolute h-full bg-pl-primary")} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={tc(
          "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "block h-5 w-5 rounded-full border-2 border-pl-primary bg-pl-surface shadow-pl-sm ring-offset-pl-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        )} />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }