import {
  RegisterRequestSchema,
  RegisterRequestDto,
  ErrorCodes,
} from "@blue0206/members-only-shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Header } from "@/components/layout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logger } from "@/utils/logger";
import { useRegisterUserMutation } from "@/app/services/authApi";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { ErrorPageDetailsType } from "@/types";

export function Register() {
  // Avatar state.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form.
  const form = useForm<RegisterRequestDto>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      username: "",
      firstname: "",
      middlename: "",
      lastname: "",
      password: "",
      avatar: null,
    },
  });

  // File input ref to allow reselect of same file after removal.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize navigation.
  const navigate = useNavigate();

  // Initialize register user mutation.
  const [registerUser, { data, isLoading, isSuccess, error, isError }] =
    useRegisterUserMutation();

  // Get error details from custom hook.
  const errorDetails = useApiErrorHandler(error);

  // Handle user registration success.
  useEffect(() => {
    if (isSuccess) {
      // Navigate to home page.
      void navigate("/", {
        replace: true,
      });
      // Show success toast.
      toast.success(
        <>
          <div>Registration successful!</div>
          <div>
            <span>Welcome to the club, </span>
            <span className="font-bold">{data.user?.username}!</span>
          </div>
        </>
      );
    }
  }, [isSuccess, data?.user?.username, navigate]);

  // Handle form submission errors.
  useEffect(() => {
    // Check if error is present.
    if (isError) {
      // Check if error is an API error.
      if (errorDetails.isApiError) {
        // Navigate to error page for server errors.
        if (errorDetails.statusCode && errorDetails.statusCode >= 500) {
          void navigate("/error", {
            state: {
              statusCode: errorDetails.statusCode,
              message: errorDetails.message,
            } satisfies ErrorPageDetailsType,
          });
        } else {
          // Conditionally filter out errors specific to Register page
          // and handle them separately, see the api documentation link:
          // (https://github.com/blue0206/members-only-shared-types/tree/main?tab=readme-ov-file#register-user)
          // Show a generic toast for other errors.
          switch (errorDetails.code) {
            case ErrorCodes.VALUE_TOO_LONG: {
              // Show error in field if field name is known.
              if (errorDetails.message.includes("username")) {
                form.setError("username", {
                  message: errorDetails.message,
                });
              } else {
                // Show a toast message if field not known.
                toast.error(errorDetails.message, {
                  position: "top-center",
                  closeButton: true,
                });

                // Reset all form fields.
                form.reset();
              }
              break;
            }
            case ErrorCodes.UNIQUE_CONSTRAINT_VIOLATION: {
              if (errorDetails.message.includes("username")) {
                // Show error in field if field name is known.
                form.setError("username", {
                  message: errorDetails.message,
                });
              } else {
                // Show a toast message if field not known.
                toast.error(errorDetails.message, {
                  position: "top-center",
                  closeButton: true,
                });

                // Reset all form fields.
                form.reset();
              }
              break;
            }
            default: {
              // Show a generic toast for other errors.
              toast.error(errorDetails.message); // Displayed on bottom-right by default.
            }
          }
        }
      } else if (errorDetails.isValidationError) {
        // Show a generic toast for validation errors. They are unlikely as handled by RHF anyways.
        toast.error(errorDetails.message); // Displayed on bottom-right by default.

        // Just to be safe, we also trigger the validation of all fields to show validation errors
        // if they are present.
        // This is unlikely as frontend and backend use the same schema to validate the form data.
        void form.trigger([
          "username",
          "password",
          "avatar",
          "firstname",
          "middlename",
          "lastname",
        ]);
      } else {
        // Navigate to error page for other errors.
        void navigate("/error", {
          state: {
            statusCode: errorDetails.statusCode ?? 500,
            message: errorDetails.message,
          } satisfies ErrorPageDetailsType,
        });
      }
    }
  }, [errorDetails, isError, navigate, form]);

  // Submit the form data by calling the register user mutation.
  const submitHandler = async (data: RegisterRequestDto) => {
    await registerUser(data);
  };

  /**
   * Handles file upload input changes by updating the form state with the file and setting an avatar preview.
   *
   * If the file is valid, it is read as a data URL and set as the avatar preview.
   * If the file is invalid, the avatar preview is set to null and an error is logged.
   *
   * @param e - The change event.
   * @param onChange - The react-hook-form function to update the form state.
   */
  const fileUploadHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: unknown[]) => void
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      // Update form state with file.
      onChange(file);

      // Initialize reader.
      const reader = new FileReader();

      // Set avatar preview when loaded.
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };

      // Set avatar preview to null on error and log.
      reader.onerror = (e) => {
        setAvatarPreview(null);
        onChange(null);
        logger.error({ fileError: e }, "Error reading uploaded file.");
      };

      // Read file as data URL.
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-screen h-screen">
      <Header />

      <div className="container max-w-2xl px-4 md:max-w-4xl py-11 mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <UserPlus className="h-11 w-11 text-primary" />
          </div>

          <h1 className="text-4xl font-bold">Create Account</h1>

          <p className="text-muted-foreground mt-2 text-center">
            Fill in your details to get started with your new account
          </p>
        </div>

        <Separator className="my-6" />

        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={form.handleSubmit(submitHandler)}>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={"firstname"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ford" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={"middlename"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span>Middle Name </span>
                            <span className="text-muted-foreground text-xs">
                              (Optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Lalatina" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={"lastname"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span>Last Name </span>
                            <span className="text-muted-foreground text-xs">
                              (Optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Dustiness" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Account Information
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={"username"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="darkness" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be your unique identifier.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={"password"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type={"password"}
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="whitespace-pre-line" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4 gap-1.5">
                    <span>Profile Picture </span>
                    <span className="text-muted-foreground text-sm font-normal">
                      (Optional)
                    </span>
                  </h2>
                  <div className="bg-muted/40 rounded-lg p-6 flex flex-col items-center">
                    <FormField
                      control={form.control}
                      name={"avatar"}
                      render={({
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        field: { onChange, value, ref, ...rest },
                      }) => (
                        <FormItem className="flex flex-col items-center space-y-4 w-full">
                          <div className="relative">
                            <Avatar className="h-32 w-32">
                              <AvatarImage
                                src={avatarPreview ?? undefined}
                                alt="Avatar preview"
                              />
                              <AvatarFallback className="bg-muted">
                                <User className="h-16 w-16 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <FormControl>
                            <div className="flex flex-col items-center">
                              <Label
                                htmlFor="avatar-upload"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md cursor-pointer dark:text-foreground"
                              >
                                Choose Image
                              </Label>
                              <Input
                                id={"avatar-upload"}
                                type={"file"}
                                accept={
                                  "image/png,image/jpeg,image/jpg,image/webp"
                                }
                                max={1}
                                className="sr-only"
                                onChange={(e) => {
                                  fileUploadHandler(e, onChange);
                                }}
                                ref={(e) => {
                                  ref(e);
                                  fileInputRef.current = e;
                                }}
                                {...rest}
                              />
                              <Button
                                variant={
                                  avatarPreview ? "destructive" : "outline"
                                }
                                className="px-4 py-2 rounded-md cursor-pointer mt-4"
                                size={"sm"}
                                disabled={!avatarPreview}
                                onClick={() => {
                                  setAvatarPreview(null);
                                  onChange(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                Remove
                              </Button>
                              <p className="text-sm text-muted-foreground mt-2">
                                JPG, JPEG, PNG or WEBP (max. 8MB)
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage className="text-center" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-5 justify-center items-center md:flex-row md:justify-between">
              <Button
                type={"submit"}
                size={"lg"}
                className="px-8 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner
                    className="text-background w-[6ch] dark:text-foreground"
                    size={"small"}
                  />
                ) : (
                  "Register"
                )}
              </Button>
              <div className="text-center text-sm">
                Have an account?{" "}
                <Link to={"/login"} className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
