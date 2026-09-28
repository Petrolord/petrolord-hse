import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

/**
 * Reusable row action menu: an Edit item and a Delete item that opens a
 * confirmation dialog before invoking onDelete. Pass only the handlers you need.
 *
 * Used only by the Environment and Risk modules (design family batch 2A), so
 * it renders the theme roles directly.
 */
export default function RowActions({
  onEdit,
  onDelete,
  deleteTitle = "Delete this record?",
  deleteDescription = "This action cannot be undone.",
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem className="cursor-pointer text-pl-danger-text focus:bg-pl-danger-bg focus:text-pl-danger-text" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-pl-danger text-pl-danger-fg hover:bg-pl-danger/90" onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
