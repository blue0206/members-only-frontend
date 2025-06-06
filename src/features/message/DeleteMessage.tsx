import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AlertTriangle, MessageSquareX, X } from "lucide-react";
import { useMediaQuery } from "react-responsive";

interface DeleteMessagePropsType {
  deleteDialog: boolean;
  setDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteMessage(props: DeleteMessagePropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  if (isDesktop) {
    return (
      <Dialog open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Message</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this message?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md text-sm bg-destructive/15 text-red-800 dark:text-destructive">
            <p>
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setDeleteDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button variant={"destructive"} className="cursor-pointer">
              <MessageSquareX className="h-4 w-4 mr-2" />
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={props.deleteDialog} onOpenChange={props.setDeleteDialog}>
      <DrawerContent className="px-4 py-4">
        <div className="mx-auto bg-destructive/15 h-12 w-12 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6.5 w-6.5 text-destructive" />
        </div>
        <DrawerHeader>
          <DrawerTitle className="text-center">Delete Message</DrawerTitle>
          <DrawerDescription className="text-center">
            Are you sure you want to delete this message?
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 border rounded-md text-sm bg-destructive/15 text-red-800 dark:text-destructive">
          <p>
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setDeleteDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>
          <Button variant={"destructive"} className="cursor-pointer">
            <MessageSquareX className="h-4 w-4 mr-2" />
            Delete Message
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
