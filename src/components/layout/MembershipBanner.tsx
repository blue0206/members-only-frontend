import { Crown, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useMediaQuery } from "react-responsive";

export default function MembershipBanner() {
  const isMobile = useMediaQuery({
    query: "(max-width: 580px)",
  });
  return (
    <Card className="p-8 bg-gradient-to-r from-amber-50 to-orange-200 border-amber-200 dark:from-amber-950 dark:to-orange-800 dark:border-amber-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <Crown className="h-5 w-5 md:h-8 md:w-8 text-amber-600 dark:text-amber-200" />
          </div>
          <div>
            <h3 className="font-semibold md:text-lg flex items-center space-x-2">
              <span>Become a Member</span>
              {!isMobile && <Star className="h-4 w-4 text-amber-500" />}
            </h3>
            {!isMobile && (
              <div className="text-muted-foreground dark:text-muted-background">
                Unlock the ability to see authors and much more!
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-500/85 dark:text-background cursor-pointer">
            <Crown className="h-4 w-4" />
            <span>Upgrade Now</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
