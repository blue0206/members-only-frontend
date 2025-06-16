import { LogIn, MessageCircle, UserPlus } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { useMediaQuery } from "react-responsive";

export default function LoginBanner() {
  const loginBannerWidthLimit = useMediaQuery({
    query: "(min-width: 611px)",
  });

  const navigate = useNavigate();

  return (
    <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-200 border-blue-200 dark:from-blue-950 dark:to-indigo-800 dark:border-blue-800">
      <div className="flex sm:flex-row flex-col sm:gap-0 gap-2.5 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-200" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Join the conversation!</h3>
            {loginBannerWidthLimit && (
              <div className="text-muted-foreground dark:text-muted-background">
                Sign in to share your thoughts and connect with the community.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant={"outline"}
            className="flex items-center space-x-2 dark:bg-background dark:hover:bg-background/85 cursor-pointer"
            onClick={() => {
              void navigate("/login");
            }}
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Button>
          <Button
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => {
              void navigate("/register");
            }}
          >
            <UserPlus className="h-4 w-4" />
            <span>Register</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
