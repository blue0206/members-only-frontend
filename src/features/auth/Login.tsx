import {
  LoginRequestSchema,
  LoginRequestDto,
  ErrorCodes,
} from "@blue0206/members-only-shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Header } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { useLoginUserMutation } from "@/app/services/authApi";
import { Spinner } from "@/components/ui/spinner";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { toast } from "sonner";
import { useEffect } from "react";
import { ErrorPageDetailsType } from "@/types";

export function Login() {
  // Initialize form.
  const form = useForm<LoginRequestDto>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Initialize navigation.
  const navigate = useNavigate();

  // Initialize login user mutation.
  const [loginUser, { isLoading, isSuccess, isError, error }] =
    useLoginUserMutation();

  // Handle form submission success.
  if (isSuccess) {
    void navigate("/", {
      replace: true,
    });
    toast.success("Login successful!");
  }
  // Get error details from custom hook.
  const errorDetails = useApiErrorHandler(error);

  // Handle form submission errors.
  useEffect(() => {
    // Check if there is an error.
    if (isError) {
      // Check if error is from API.
      if (errorDetails.isApiError) {
        // Navigate to error page for server errors.
        if (errorDetails.statusCode && errorDetails.statusCode >= 500) {
          void navigate("/error", {
            state: {
              statusCode: errorDetails.statusCode,
              message: errorDetails.message,
            } satisfies ErrorPageDetailsType,
          });
        }

        // Conditionally filter out errors specific to Login page
        // and handle them separately, see the api documentation link:
        // (https://github.com/blue0206/members-only-shared-types/tree/main?tab=readme-ov-file#login-user)
        // Show a generic toast for other errors.
        switch (errorDetails.code) {
          case ErrorCodes.UNAUTHORIZED: {
            // Show error via toast.
            toast.error(errorDetails.message, {
              position: "top-center",
              closeButton: true,
            });

            // Reset the form fields.
            form.resetField("username");
            form.resetField("password");
            break;
          }
          case ErrorCodes.VALUE_TOO_LONG: {
            // Show error in field if field name is known.
            if (errorDetails.message.includes("username")) {
              form.setError("username", {
                message: errorDetails.message,
              });
            } else if (errorDetails.message.includes("password")) {
              form.setError("password", {
                message: errorDetails.message,
              });
            } else {
              // Show a toast message if field not known.
              toast.error(errorDetails.message, {
                position: "top-center",
                closeButton: true,
              });
            }
            break;
          }
          default: {
            toast.error(errorDetails.message); // Displayed on bottom-right by default.
          }
        }

        // Check if error is from failed Validation.
      } else if (errorDetails.isValidationError) {
        // Show a generic toast for validation errors. They are unlikely as handled by RHF anyways.
        toast.error(errorDetails.message); // Displayed on bottom-right by default.

        // Just to be safe, we also trigger the validation of all fields to show validation errors
        // if they are present.
        // This is unlikely as frontend and backend use the same schema to validate the form data.
        void form.trigger(["username", "password"]);

        // Navigate to error page for all other errors.
      } else {
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
    }
  }, [errorDetails, isError, form, navigate]);

  // Submit the form data by calling the login user mutation.
  const submitHandler = async (data: LoginRequestDto): Promise<void> => {
    await loginUser(data);
  };

  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome Back</CardTitle>
                <CardDescription>Login with your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                  <form onSubmit={form.handleSubmit(submitHandler)}>
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="darkness" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      ></FormField>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="whitespace-pre-line" />
                          </FormItem>
                        )}
                      ></FormField>
                      <Button
                        type="submit"
                        className={`w-full cursor-pointer ${
                          isLoading ? "opacity-80" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Spinner
                            className="text-background dark:text-foreground"
                            size={"small"}
                          />
                        ) : (
                          "Login"
                        )}
                      </Button>
                      <div className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                          to={"/register"}
                          className="underline underline-offset-4"
                        >
                          Register
                        </Link>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
