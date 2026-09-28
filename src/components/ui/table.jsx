import * as React from "react"
import { cn } from "@/lib/utils"
import { useThemeClass } from "@/design/themeClass"

// Legacy strings outside a design-system scope (byte for byte); inside, the
// Suite's table: sunken header, uppercase muted labels, hairline rows.

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return <thead ref={ref} className={cn(tc("[&_tr]:border-b", "[&_tr]:border-b bg-pl-sunken"), className)} {...props} />
})
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <tfoot
      ref={ref}
      className={cn(
        tc("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", "border-t border-pl-border bg-pl-sunken/60 font-medium [&>tr]:last:border-b-0"),
        className
      )}
      {...props}
    />
  )
})
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <tr
      ref={ref}
      className={cn(
        tc("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", "border-b transition-colors border-pl-border hover:bg-pl-sunken/60 data-[state=selected]:bg-pl-sunken"),
        className
      )}
      {...props}
    />
  )
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <th
      ref={ref}
      className={cn(
        tc(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          "px-4 text-left align-middle [&:has([role=checkbox])]:pr-0 h-10 text-xs font-semibold uppercase tracking-wide text-pl-muted"
        ),
        className
      )}
      {...props}
    />
  )
})
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <td
      ref={ref}
      className={cn(tc("p-4 align-middle [&:has([role=checkbox])]:pr-0", "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-pl-text"), className)}
      {...props}
    />
  )
})
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(({ className, ...props }, ref) => {
  const tc = useThemeClass()
  return (
    <caption
      ref={ref}
      className={cn(tc("mt-4 text-sm text-muted-foreground", "mt-4 text-sm text-pl-muted"), className)}
      {...props}
    />
  )
})
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}