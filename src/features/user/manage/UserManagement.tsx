import { useAppSelector } from "@/app/hooks";
import { useGetUsersQuery } from "@/app/services/userApi";
import { Header } from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDateFromTimestamp, getTimeElapsed } from "@/utils/timestampFormat";
import { GetUsersResponseDto, Role } from "@blue0206/members-only-shared-types";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
  Calendar,
  Crown,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  ShieldUser,
  User,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getUser } from "@/features/auth/authSlice";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useNavigate } from "react-router";
import { ErrorPageDetailsType } from "@/types";
import {
  RoleFilterOptions,
  RoleFilterOptionsType,
  UserStatusFilterOptions,
  UserStatusFilterOptionsType,
} from "@/lib/constants";
import userFilter, { getUserStatus } from "@/utils/userFilter";
import DeleteUser from "./DeleteUser";
import ChangeRole from "./ChangeRole";

const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return <Shield className="h-4 w-4 text-destructive" />;
    case Role.MEMBER:
      return <Crown className="h-4 w-4 text-primary" />;
    case Role.USER:
      return <User className="h-4 w-4 text-gray-800 dark:text-gray-100" />;
  }
};

const getRoleBadge = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return (
        <Badge
          variant={"outline"}
          className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border-red-200 rounded-xl text-xs"
        >
          ADMIN
        </Badge>
      );
    case Role.MEMBER:
      return (
        <Badge
          variant={"outline"}
          className="rounded-xl text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100"
        >
          MEMBER
        </Badge>
      );
    case Role.USER:
      return (
        <Badge
          variant={"outline"}
          className="rounded-xl text-xs bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100"
        >
          USER
        </Badge>
      );
  }
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<RoleFilterOptionsType>(
    RoleFilterOptions.all
  );
  const [statusFilter, setStatusFilter] = useState<UserStatusFilterOptionsType>(
    UserStatusFilterOptions.all
  );

  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [deleteUser, setDeleteUser] = useState<
    GetUsersResponseDto[number] | null
  >(null);

  const [changeRoleDialog, setChangeRoleDialog] = useState<boolean>(false);
  const [changeRoleUser, setChangeRoleUser] = useState<
    GetUsersResponseDto[number] | null
  >(null);

  const authUser = useAppSelector(getUser);

  const { data, isSuccess, isError, error } = useGetUsersQuery();
  const errorDetails = useApiErrorHandler(error);

  const navigate = useNavigate();

  // Handle api call errors.
  useEffect(() => {
    if (isError) {
      // Since this is a basic GET request, it will throw 5xx or 404 errors,
      // or RTK Query error and for all of them, we navigate to error page.
      void navigate("/error", {
        state: {
          message: errorDetails.message,
          statusCode: errorDetails.statusCode ?? 500,
        } satisfies ErrorPageDetailsType,
      });
    }
  }, [isError, errorDetails, navigate]);

  // Handle api success.
  useEffect(() => {
    if (isSuccess) {
      setSearchQuery("");
      setRoleFilter("all");
      setStatusFilter("all");
    }
  }, [isSuccess]);

  // Filter data based on search query and filters.
  const filteredData = data
    ? userFilter(data, searchQuery, roleFilter, statusFilter)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="flex items-center mb-2 font-bold text-4xl">
              <ShieldUser className="h-10 w-10 mr-2 text-destructive" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and roles.
            </p>
          </div>

          <Badge variant={"secondary"} className="text-sm w-fit rounded-xl">
            {filteredData.length} users
          </Badge>
        </div>

        <Card className="mb-6">
          <div className="p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users...."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Select
                  value={roleFilter as string}
                  onValueChange={(value) => {
                    setRoleFilter(value as RoleFilterOptionsType);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <SelectValue placeholder="Role" />
                    </div>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={RoleFilterOptions.all}>
                      All Roles
                    </SelectItem>
                    <SelectItem value={RoleFilterOptions.admin}>
                      Admin
                    </SelectItem>
                    <SelectItem value={RoleFilterOptions.member}>
                      Member
                    </SelectItem>
                    <SelectItem value={RoleFilterOptions.user}>User</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter as string}
                  onValueChange={(value) => {
                    setStatusFilter(value as UserStatusFilterOptionsType);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={UserStatusFilterOptions.all}>
                      All Status
                    </SelectItem>
                    <SelectItem value={UserStatusFilterOptions.active}>
                      Active
                    </SelectItem>
                    <SelectItem value={UserStatusFilterOptions.inactive}>
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="py-0">
          <div className="rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Active
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar ?? ""}
                            loading="lazy"
                            alt="User Avatar"
                          />
                          <AvatarFallback>
                            <User />
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {user.firstname} {user.middlename} {user.lastname}
                          </p>
                          <p className="text-xs text-muted-foreground runcate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{getDateFromTimestamp(user.joinDate)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={
                          getUserStatus(user.lastActive) === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={`text-xs rounded-xl dark:text-foreground`}
                      >
                        {getTimeElapsed(user.lastActive)}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className="text-right"
                      hidden={user.id === authUser?.id}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setChangeRoleDialog(true);
                              setChangeRoleUser(user);
                            }}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant={"destructive"}
                            onClick={() => {
                              setDeleteDialog(true);
                              setDeleteUser(user);
                            }}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-center">
                          No users found
                        </p>
                        {data && data.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filters
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <DeleteUser
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          user={deleteUser}
        />

        <ChangeRole
          changeRoleDialog={changeRoleDialog}
          setChangeRoleDialog={setChangeRoleDialog}
          user={changeRoleUser}
        />
      </main>
    </div>
  );
}
