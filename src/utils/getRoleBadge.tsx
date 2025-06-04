import React from "react";
import { Role } from "@blue0206/members-only-shared-types";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Shield } from "lucide-react";

export function getRoleBadge(role: Role): React.ReactNode {
  switch (role) {
    case Role.USER:
      return (
        <Badge
          variant={"outline"}
          className="rounded-xl flex text-xs items-center gap-1 bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100"
        >
          <User className="h-3.5 w-3.5" />
          {role}
        </Badge>
      );
    case Role.MEMBER:
      return (
        <Badge
          variant={"outline"}
          className="rounded-xl text-xs flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100"
        >
          <Crown className="h-3.5 w-3.5" />
          {role}
        </Badge>
      );
    case Role.ADMIN:
      return (
        <Badge
          variant={"outline"}
          className="rounded-xl text-xs flex items-center gap-1 bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100"
        >
          <Shield className="h-3.5 w-3.5" />
          {role}
        </Badge>
      );
    default:
      return null;
  }
}
