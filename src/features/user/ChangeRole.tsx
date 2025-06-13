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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleBadge } from "@/utils/getRoleBadge";
import { GetUsersResponseDto, Role } from "@blue0206/members-only-shared-types";
import { Check, Crown, X } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

interface ChangeRolePropsType {
  changeRoleDialog: boolean;
  setChangeRoleDialog: React.Dispatch<React.SetStateAction<boolean>>;
  user: GetUsersResponseDto[number] | null;
}

export default function ChangeRole(props: ChangeRolePropsType) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const [role, setRole] = useState<Role>(
    props.user ? props.user.role : Role.USER
  );

  if (isDesktop) {
    return (
      <Dialog
        open={props.changeRoleDialog}
        onOpenChange={props.setChangeRoleDialog}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6.5 w-6.5 text-primary" />
            </div>
            <DialogTitle className="text-center">Change User Role</DialogTitle>
            <DialogDescription className="text-center">
              Update the role and permissions for{" "}
              <span className="font-semibold text-primary">
                @{props.user?.username}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Current Role</p>
              <div className="flex items-center justify-center">
                {props.user && getRoleBadge(props.user.role)}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <p className="text-sm font-medium">New Role</p>
              <Select
                value={role as string}
                onValueChange={(value) => {
                  setRole(value as Role);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                  <SelectItem value={Role.MEMBER}>MEMBER</SelectItem>
                  <SelectItem value={Role.USER}>USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setChangeRoleDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button className="cursor-pointer">
              <Check className="h-4 w-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={props.changeRoleDialog}
      onOpenChange={props.setChangeRoleDialog}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="mx-auto bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-6.5 w-6.5 text-primary" />
          </div>
          <DrawerTitle className="text-center">Change User Role</DrawerTitle>
          <DrawerDescription className="text-center">
            Update the role and permissions for{" "}
            <span className="font-semibold text-primary">
              @{props.user?.username}
            </span>
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Current Role</p>
            <div className="flex items-center justify-center">
              {props.user && getRoleBadge(props.user.role)}
            </div>
          </div>

          <div className="space-y-2 w-full">
            <p className="text-sm font-medium">New Role</p>
            <Select
              value={role as string}
              onValueChange={(value) => {
                setRole(value as Role);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                <SelectItem value={Role.MEMBER}>MEMBER</SelectItem>
                <SelectItem value={Role.USER}>USER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                props.setChangeRoleDialog(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerClose>
          <Button className="cursor-pointer">
            <Check className="h-4 w-4 mr-2" />
            Update Role
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
