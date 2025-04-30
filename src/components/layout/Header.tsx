import { NavLink } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { isAuthenticated, getUserAvatar } from "@/features/auth/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useLogoutUserMutation } from "@/app/services/authApi";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const isAuth = useAppSelector(isAuthenticated);
  const avatar = useAppSelector(getUserAvatar);
  const [logoutUser] = useLogoutUserMutation();

  const logoutHandler = async (): Promise<void> => {
    await logoutUser();
  };

  return (
    <div
      className={`w-screen h-16 bg-accent text-foreground flex justify-between items-center px-8 ${
        className ?? ""
      }`}
    >
      <div className="flex gap-4 items-center">
        <NavLink
          className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
          to={"/"}
        >
          Home
        </NavLink>
      </div>
      <div className="flex gap-4 items-center">
        {isAuth ? (
          <>
            <div>
              <Avatar>
                <AvatarImage src={avatar ?? undefined} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            </div>
            <NavLink
              className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              to={"/"}
              onClick={() => void logoutHandler()}
            >
              Logout
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              to={"/register"}
            >
              Register
            </NavLink>
            <NavLink
              className="cursor-pointer px-4 py-2 rounded-md hover:bg-foreground/10"
              to={"/login"}
            >
              Login
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
