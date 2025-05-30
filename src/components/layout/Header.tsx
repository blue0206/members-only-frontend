import { NavLink, useNavigate } from "react-router";
import { useAppSelector } from "@/app/hooks";
import {
  isAuthenticated,
  getUserAvatar,
  getUserRole,
} from "@/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import { useLogoutUserMutation } from "@/app/services/authApi";

export function Header() {
  const isAuth = useAppSelector(isAuthenticated);
  const role = useAppSelector(getUserRole);
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
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={avatar ?? ""} />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
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
