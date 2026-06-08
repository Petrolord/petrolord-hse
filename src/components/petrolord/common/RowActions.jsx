import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

/**
 * Reusable row action menu: an Edit item and a Delete item that opens a
 * confirmation dialog before invoking onDelete. Pass only the handlers you need.
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#252541] border-[#3a3a5a] text-white">
          {onEdit && (
            <DropdownMenuItem className="cursor-pointer focus:bg-[#3a3a5a] focus:text-white" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#3a3a5a] text-gray-300 hover:bg-[#2a2a40] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
