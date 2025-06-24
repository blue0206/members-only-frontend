import { Avatar } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

export default function UserDetailSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <Skeleton className="h-full w-full rounded-full" />
          </Avatar>

          <div className="min-w-0 space-y-1">
            {/* Name */}
            <Skeleton className="h-5 w-32" />
            {/* Username */}
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1">
          {/* Role Icon */}
          <Skeleton className="h-5 w-5" />
          {/* Role Badge */}
          <Skeleton className="h-5 w-16" />
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <div className="flex items-center space-x-1">
          {/* Icon */}
          <Skeleton className="h-5 w-5" />
          {/* Timestamp (Join Date) */}
          <Skeleton className="h-5 w-20" />
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        {/* Badge showing use last active. */}
        <Skeleton className="h-5 w-25" />
      </TableCell>

      <TableCell>
        {/* MoreHorizonal */}
        <div className="flex flex-row-reverse mr-1">
          <Skeleton className="h-5 w-6" />
        </div>
      </TableCell>
    </TableRow>
  );
}
