import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

const Tabs = TabsPrimitive.Root

// Inside a scope: the Suite's sunken rail with a surface active tab.
const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        tc("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", "inline-flex h-10 items-center justify-center rounded-md border border-pl-border bg-pl-sunken p-1 text-pl-muted"),
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        tc(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-pl-bg transition-all hover:text-pl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-pl-surface data-[state=active]:text-pl-text data-[state=active]:shadow-pl-sm"
        ),
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        tc(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "mt-2 ring-offset-pl-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2"
        ),
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }