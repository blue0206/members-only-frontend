import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, UserX } from "lucide-react";
import { useState } from "react";
import DeleteAccount from "./DeleteAccount";

export default function DangerZone() {
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive text-2xl">
            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions. Please proceed with caution.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-5 border rounded-lg bg-destructive/15 text-red-800 dark:text-red-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-8 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium">Delete Account</h3>
                <p className="text-sm mt-1">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <div className="mt-3 text-xs">
                  Please note that your messages <strong>WILL NOT</strong> be
                  deleted, and will be displayed with a <em>Deleted User</em>{" "}
                  tag. If for some urgent reason you need to delete all your
                  messages, please contact our support team at{" "}
                  <a
                    className="text-primary dark:text-blue-200 underline"
                    href="blue0206.dev@gmail.com"
                  >
                    blue0206.dev@gmail.com
                  </a>
                </div>
              </div>

              <Button
                variant={"destructive"}
                className="shrink-0 cursor-pointer"
                onClick={() => {
                  setDeleteDialog(true);
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteAccount
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
      />
    </>
  );
}
