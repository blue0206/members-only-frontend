import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  useEditUserDetailsMutation,
  useUploadAvatarMutation,
} from "@/app/services/userApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser } from "@/features/auth/authSlice";
import { addNotification } from "@/features/notification/notificationSlice";
import {
  AvatarSchema,
  EditUserRequestDto,
  EditUserRequestSchema,
} from "@blue0206/members-only-shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2, Upload, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import DeleteAvatarModal from "./DeleteAvatarModal";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import useUiErrorHandler from "@/hooks/useUiErrorHandler";
import { Spinner } from "@/components/ui/spinner";

export default function EditProfile() {
  const user = useAppSelector(getUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [avatarPreview, setAvatarPreview] = useState<string | null | undefined>(
    user?.avatar
  );
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const [
    editUser,
    {
      isSuccess: isEditSuccess,
      isError: isEditError,
      error: editError,
      isLoading: editLoading,
      reset: editReset,
    },
  ] = useEditUserDetailsMutation();
  const editErrorDetails = useApiErrorHandler(editError);

  const [
    uploadAvatar,
    {
      isSuccess: isUploadSuccess,
      isError: isUploadError,
      error: uploadError,
      isLoading: uploadLoading,
      reset: uploadReset,
    },
  ] = useUploadAvatarMutation();
  const uploadErrorDetails = useApiErrorHandler(uploadError);

  const form = useForm<EditUserRequestDto>({
    resolver: zodResolver(EditUserRequestSchema),
    defaultValues: {
      newUsername: user?.username,
      newFirstname: user?.firstname,
      newMiddlename: user?.middlename ?? "",
      newLastname: user?.lastname ?? "",
    },
  });

  // File input ref to allow reselect of same file after removal.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle form default values on user detail changes.
  useEffect(() => {
    form.reset({
      newUsername: user?.username,
      newFirstname: user?.firstname,
      newMiddlename: user?.middlename ?? "",
      newLastname: user?.lastname ?? "",
    });
  }, [user, form]);

  // Handle profile edit success.
  useEffect(() => {
    if (isEditSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "Your profile has been updated successfully!",
        })
      );
      editReset();
    }
  }, [isEditSuccess, dispatch, form, user, editReset]);

  // Handle profile edit error.
  useUiErrorHandler({
    isError: isEditError,
    errorDetails: editErrorDetails,
    reset: editReset,
  });

  // Handle avatar upload success.
  useEffect(() => {
    if (isUploadSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "Your new avatar has been uploaded successfully!",
        })
      );
      uploadReset();
    }
  }, [isUploadSuccess, user?.avatar, dispatch, uploadReset]);

  // Handle avatar upload error.
  useEffect(() => {
    if (isUploadError) {
      // Only server errors or RTK Query errors are possible,
      // so we navigate to error page.
      void navigate("/error", {
        state: {
          statusCode: uploadErrorDetails.statusCode ?? 500,
          message: uploadErrorDetails.message,
        } satisfies ErrorPageDetailsType,
      });
      uploadReset();
    }
  }, [isUploadError, uploadErrorDetails, navigate, uploadReset]);

  // Update avatar on change in state.
  useEffect(() => {
    setAvatarPreview(user?.avatar);
  }, [user?.avatar]);

  const submitHandler = async (data: EditUserRequestDto): Promise<void> => {
    // Run mutation only if the data is not the same as currentProfileDetails.
    if (form.formState.isDirty) {
      await editUser(data);
    }
  };

  const fileUploadHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setErrorText("");
      const parsedFile = AvatarSchema.safeParse(file);

      if (!parsedFile.success) {
        setErrorText(parsedFile.error.flatten().formErrors[0]);
        return;
      }

      await uploadAvatar({
        avatar: file,
      }).finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>

        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(submitHandler)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 ring-4 ring-offset-4 ring-blue-100 dark:ring-blue-950">
                    <AvatarImage
                      src={avatarPreview ?? undefined}
                      alt="User Avatar"
                    />
                    <AvatarFallback>
                      <User className="h-16 w-16 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="relative mt-2">
                    <Input
                      type="file"
                      id="avatar"
                      className="hidden"
                      accept={"image/png,image/jpeg,image/jpg,image/webp"}
                      max={1}
                      onChange={(e) => {
                        void fileUploadHandler(e);
                      }}
                      disabled={editLoading || uploadLoading}
                      ref={(e) => {
                        fileInputRef.current = e;
                      }}
                    />
                    <Label
                      htmlFor="avatar"
                      // Since this is a label, we apply disable-like styling for loading.
                      className={`${
                        uploadLoading || editLoading
                          ? "cursor-not-allowed brightness-50 pointer-events-none "
                          : ""
                      } w-[18ch] flex items-center justify-center space-x-2 text-sm px-3 py-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 dark:text-foreground rounded-md cursor-pointer transition-colors`}
                    >
                      {uploadLoading ? (
                        <Spinner size={"small"} className="text-white" />
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </Label>
                  </div>
                  <p
                    className={`text-xs text-destructive max-w-[22ch] mt-1.5 mb-2 text-center ${
                      errorText ? "block" : "hidden"
                    }`}
                  >
                    {errorText}
                  </p>

                  <Button
                    type="button"
                    variant={"destructive"}
                    size={"sm"}
                    className="cursor-pointer dark:hover:bg-destructive/50"
                    disabled={!avatarPreview || editLoading || uploadLoading}
                    onClick={() => {
                      setDeleteDialog(true);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove Avatar
                  </Button>
                </div>

                <div className="space-y-4 flex-1 w-full">
                  <FormField
                    control={form.control}
                    name={"newUsername"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This is your unique identifier.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={"newFirstname"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={"newMiddlename"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span>Middle Name </span>
                          <span className="text-muted-foreground text-xs">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={"newLastname"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span>Last Name </span>
                          <span className="text-muted-foreground text-xs">
                            (Optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end mt-4">
              <Button
                type={"submit"}
                className="flex items-center space-x-2 cursor-pointer w-[16.5ch]"
                disabled={
                  editLoading || uploadLoading || !form.formState.isDirty
                }
              >
                {editLoading ? (
                  <Spinner size={"small"} className="text-white" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <DeleteAvatarModal
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
      />
    </>
  );
}
