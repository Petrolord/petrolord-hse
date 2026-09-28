// TEST-ONLY. One render of every ui-kit primitive the routed HSE screens use,
// with every portal open, so a test can capture the whole kit's DOM in one
// go. uiLegacyDom.test.jsx pins this DOM outside a scope (the legacy look
// must stay byte for byte until the rollout ends); uiThemed.test.jsx renders
// the same scenes inside a scope and checks the theme roles.
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';

const noop = () => {};

/** The inline (non-portal) primitives. */
export function InlineScene() {
  return (
    <div data-testid="inline-scene">
      <Accordion type="single" defaultValue="a" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Section</AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Alert><AlertTitle>Heads up</AlertTitle><AlertDescription>Text</AlertDescription></Alert>
      <Alert variant="destructive"><AlertTitle>Failed</AlertTitle></Alert>
      <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
      {['default', 'secondary', 'destructive', 'outline'].map((v) => <Badge key={v} variant={v}>{v}</Badge>)}
      {['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
      {['default', 'sm', 'lg', 'icon'].map((s) => <Button key={s} size={s}>{s}</Button>)}
      <Card>
        <CardHeader><CardTitle>Title</CardTitle><CardDescription>Desc</CardDescription></CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
      <Checkbox defaultChecked />
      <Checkbox />
      <Input placeholder="Name" />
      <Label htmlFor="x">Label</Label>
      <Progress value={40} />
      <ScrollArea className="h-10"><p>Scroll</p></ScrollArea>
      <Separator />
      <Separator orientation="vertical" />
      <Skeleton className="h-4 w-10" />
      <Slider defaultValue={[30]} max={100} />
      <Switch defaultChecked />
      <Switch />
      <Table>
        <TableCaption>Caption</TableCaption>
        <TableHeader><TableRow><TableHead>H</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>C</TableCell></TableRow></TableBody>
        <TableFooter><TableRow><TableCell>F</TableCell></TableRow></TableFooter>
      </Table>
      <Tabs defaultValue="one">
        <TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList>
        <TabsContent value="one">Tab one</TabsContent>
      </Tabs>
      <Textarea placeholder="Notes" />
    </div>
  );
}

/** Every portal primitive, open. */
export function PortalScene() {
  return (
    <div data-testid="portal-scene">
      <Dialog open onOpenChange={noop}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dialog</DialogTitle><DialogDescription>Dialog text</DialogDescription></DialogHeader>
          <DialogFooter><Button>OK</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open onOpenChange={noop}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Sure?</AlertDialogTitle><AlertDialogDescription>Gone</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open onOpenChange={noop}>
        <SheetContent>
          <SheetHeader><SheetTitle>Sheet</SheetTitle><SheetDescription>Sheet text</SheetDescription></SheetHeader>
        </SheetContent>
      </Sheet>
      <DropdownMenu open onOpenChange={noop} modal={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Check</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open onOpenChange={noop}>
        <PopoverTrigger>Pop</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
      <TooltipProvider>
        <Tooltip open onOpenChange={noop}>
          <TooltipTrigger>Tip</TooltipTrigger>
          <TooltipContent>Tooltip body</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Select open onOpenChange={noop} defaultValue="a">
        <SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
      <ToastProvider>
        <Toast open onOpenChange={noop}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Done</ToastDescription>
          <ToastAction altText="Undo">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <Toast open onOpenChange={noop} variant="destructive"><ToastTitle>Failed</ToastTitle></Toast>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}

/** Radix generates ids per render; blank them so the DOM compares. */
export function normaliseDom(html) {
  return html
    .replace(/radix-:[a-z0-9]+:/gi, 'radix-ID')
    .replace(/:r[a-z0-9]+:/gi, ':rID:');
}
