import {
  RegisterRequestSchema,
  RegisterRequestDto,
} from "@blue0206/members-only-shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
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

export function Register() {
  const form = useForm<RegisterRequestDto>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      username: "",
      firstname: "",
      password: "",
    },
  });

  const submitHandler = (data: RegisterRequestDto) => {
    // RTK Query call here.
    console.log(data);
  };

  return (
    <div className="w-screen h-screen">
      <Header />

      <div className="container max-w-2xl px-4 md:max-w-4xl md:px-0 py-11 mx-auto">
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
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center space-y-4 w-full">
                          <div className="relative">
                            <Avatar className="h-32 w-32">
                              <AvatarImage src={""} alt="Avatar preview" />
                              <AvatarFallback className="bg-muted">
                                <User className="h-16 w-16 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <FormControl>
                            <div className="flex flex-col items-center">
                              <Label
                                htmlFor="avatar-upload"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md cursor-pointer"
                              >
                                Choose Image
                              </Label>
                              <Input
                                id={"avatar-upload"}
                                type={"file"}
                                accept={
                                  "image/png,image/jpeg,image/jpg,image/webp"
                                }
                                className="sr-only"
                                {...field}
                              />
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
              >
                Register
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
