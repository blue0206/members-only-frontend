import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface MessageSkeletonPropsType {
  bookmark?: boolean;
}

export default function MessageSkeleton(props: MessageSkeletonPropsType) {
  return (
    <Card className="p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-950">
              <Skeleton className="h-full w-full rounded-full" />
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {/* Author Name */}
                <Skeleton className="h-5 w-32" />
                {/* Author Badge */}
                <Skeleton className="h-5 w-16" />
              </div>
              {/* Timestamp */}
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center space-x-2">
            {/* Bookmark Timestamp */}
            {props.bookmark && <Skeleton className="h-4 sm:w-24 w-0" />}
            {/* Options */}
            <Skeleton className="h-5 w-6 mr-2.5" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <Skeleton className="h-8 w-11" />
          <Skeleton className="h-8 w-11" />
        </div>
      </div>
    </Card>
  );
}
