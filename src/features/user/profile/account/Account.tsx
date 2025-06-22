import { useAppDispatch } from "@/app/hooks";
import { useResetPasswordMutation } from "@/app/services/userApi";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { addNotification } from "@/features/notification/notificationSlice";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { ErrorPageDetailsType } from "@/types";
import {
  ErrorCodes,
  ResetPasswordRequestSchema,
} from "@blue0206/members-only-shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  oldPassword: ResetPasswordRequestSchema.shape.oldPassword,
  newPassword: ResetPasswordRequestSchema.shape.newPassword,
  confirmPassword: z.string().min(1),
});
type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

export default function Account() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [resetPassword, { isSuccess, isError, error, reset, isLoading }] =
    useResetPasswordMutation();
  const errorDetails = useApiErrorHandler(error);

  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password reset success.
  useEffect(() => {
    if (isSuccess) {
      dispatch(
        addNotification({
          type: "success",
          message: "Your password has been updated successfully!",
        })
      );
      form.reset();
      reset();
    }
  }, [isSuccess, dispatch, form, reset]);

  // Handle password reset error.
  useEffect(() => {
    if (isError) {
      if (
        errorDetails.statusCode === 401 &&
        errorDetails.code === ErrorCodes.INCORRECT_PASSWORD
      ) {
        form.setError("oldPassword", {
          message: errorDetails.message,
        });
      } else {
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
      reset();
    }
  }, [isError, form, navigate, errorDetails, reset]);

  const resetPasswordHandler = async (data: ResetPasswordType) => {
    let errorFlag = false;
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", {
        message: "Passwords do not match.",
      });
      errorFlag = true;
    }
    if (data.oldPassword === data.newPassword) {
      form.setError("newPassword", {
        message: "New password cannot be the same as the old password.",
      });
      errorFlag = true;
    }

    if (errorFlag) return;

    await resetPassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Account Security</CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>

        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(resetPasswordHandler)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name={"oldPassword"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input {...field} type={"password"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"newPassword"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type={"password"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={"confirmPassword"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type={"password"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end mt-5">
              <Button
                type={"submit"}
                className="flex items-center space-x-2 w-[16.5ch] cursor-pointer"
                disabled={isLoading || !form.formState.isDirty}
              >
                {isLoading ? (
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
    </>
  );
}
