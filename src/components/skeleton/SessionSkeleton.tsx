import { Skeleton } from "../ui/skeleton";

export default function SessionSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0 bg-background/50">
      <div className="flex items-start space-x-4">
        <div>
          {/* Device Icon */}
          <Skeleton className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Device Name */}
          <Skeleton className="h-5 w-40" />
          {/* Details Block (browser, os, location, ip, etc.) */}
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {/* Logout Button */}
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
