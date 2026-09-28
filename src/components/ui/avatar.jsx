import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

// Inside a design-system scope: the Suite's sunken fallback.
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        tc("flex h-full w-full items-center justify-center rounded-full bg-muted", "flex h-full w-full items-center justify-center rounded-full bg-pl-sunken text-pl-muted font-medium"),
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }