import { NavLink, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  isAuthenticated,
  getUserAvatar,
  getUser,
} from "@/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  Settings,
  Bookmark,
  LogOut,
  Shield,
  Crown,
  Sun,
  Moon,
  Server,
  Check,
} from "lucide-react";
import { useLogoutUserMutation } from "@/app/services/authApi";
import { Badge } from "@/components/ui/badge";
import { Role } from "@blue0206/members-only-shared-types";
import { getTheme, setTheme } from "@/features/ui/uiSlice";

export function Header() {
  const isAuth = useAppSelector(isAuthenticated);
  const user = useAppSelector(getUser);
  const avatar = useAppSelector(getUserAvatar);
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(getTheme);

  const navigate = useNavigate();

  const logoutHandler = async (): Promise<void> => {
    await logoutUser();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/55">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="space-x-5 flex items-center">
            <div className="flex items-center space-x-2">
              <Users className="text-primary" />
              <span className="font-semibold text-lg">Members Only</span>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              >
                About
              </NavLink>
              <NavLink
                to="/guidelines"
                className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              >
                Guidelines
              </NavLink>
            </nav>
          </div>

          <div className="space-x-4 flex items-center">
            {isAuth ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="h-11 w-11 rounded-full p-0.5 cursor-pointer"
                  >
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={avatar ?? ""} />
                      <AvatarFallback>
                        <User className="h-11 w-11" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.firstname} {user?.middlename} {user?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{user?.username}
                      </p>
                      {user && user.role === Role.ADMIN ? (
                        <Badge className="w-fit flex items-center gap-1 bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100">
                          <Shield className="h-4 w-4" />
                          {user.role}
                        </Badge>
                      ) : user?.role === Role.MEMBER ? (
                        <Badge className="w-fit flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100">
                          <Crown className="h-4 w-4" />
                          {user.role}
                        </Badge>
                      ) : (
                        <Badge className="w-fit flex items-center gap-1 bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100">
                          <User className="h-4 w-4" />
                          {user?.role}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => void logoutHandler()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-4">
                <Button
                  className="cursor-pointer"
                  variant={"ghost"}
                  onClick={() => {
                    void navigate("/login");
                  }}
                >
                  Login
                </Button>
                <Button
                  className="bg-foreground text-background hover:bg-foreground/85 cursor-pointer dark:text-background"
                  onClick={() => {
                    void navigate("/register");
                  }}
                >
                  Register
                </Button>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="cursor-pointer"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle Theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => dispatch(setTheme("light"))}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                  {currentTheme === "light" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => dispatch(setTheme("dark"))}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                  {currentTheme === "dark" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => dispatch(setTheme("system"))}>
                  <Server className="mr-2 h-4 w-4" />
                  System
                  {currentTheme === "system" && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
