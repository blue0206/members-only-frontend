import { NavLink, useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";
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
} from "lucide-react";
import { useLogoutUserMutation } from "@/app/services/authApi";
import { Badge } from "@/components/ui/badge";
import { Role } from "@blue0206/members-only-shared-types";

export function Header() {
  const isAuth = useAppSelector(isAuthenticated);
  const user = useAppSelector(getUser);
  const avatar = useAppSelector(getUserAvatar);
  const [logoutUser] = useLogoutUserMutation();

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
                <DropdownMenuContent className="w-56 align-end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.firstname} {user?.middlename} {user?.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{user?.username}
                      </p>
                      {user && user.role === Role.ADMIN ? (
                        <Badge
                          variant={"destructive"}
                          className="w-fit flex items-center gap-1"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {user.role}
                        </Badge>
                      ) : user?.role === Role.MEMBER ? (
                        <Badge
                          variant={"default"}
                          className="w-fit flex items-center gap-1"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          {user.role}
                        </Badge>
                      ) : (
                        <Badge
                          variant={"secondary"}
                          className="w-fit flex items-center gap-1"
                        >
                          <User className="h-3.5 w-3.5" />
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
                  className="bg-foreground text-background hover:bg-foreground/85 cursor-pointer"
                  onClick={() => {
                    void navigate("/register");
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
