import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

function Skeleton({
  className,
  ...props
}) {
  const tc = useThemeClass()
  return (
    (<div
      className={cn(tc("animate-pulse rounded-md bg-muted", "animate-pulse rounded-md bg-pl-border/70"), className)}
      {...props} />)
  );
}

export { Skeleton }