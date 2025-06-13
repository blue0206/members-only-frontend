import {
  RoleFilterOptions,
  RoleFilterOptionsType,
  UserStatusFilterOptions,
  UserStatusFilterOptionsType,
} from "@/lib/constants";
import { GetUsersResponseDto } from "@blue0206/members-only-shared-types";

export default function userFilter(
  data: GetUsersResponseDto,
  searchQuery: string,
  roleFilter: RoleFilterOptionsType,
  statusFilter: UserStatusFilterOptionsType
): GetUsersResponseDto {
  return data.filter((user) => {
    const searchMatch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.middlename ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (user.lastname ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const roleMatch =
      roleFilter === RoleFilterOptions.all || user.role === roleFilter;

    // User is inactive if inactive for a week or more.
    const userStatus = getUserStatus(user.lastActive);

    const statusMatch =
      statusFilter === UserStatusFilterOptions.all ||
      userStatus === statusFilter;

    return searchMatch && roleMatch && statusMatch;
  });
}

export const getUserStatus = (
  lastActive: string | Date
): UserStatusFilterOptionsType => {
  // User inactive if not active for a week or more.
  const lastActiveTime = new Date(lastActive).getTime();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const timeSevenDaysAgo = Date.now() - sevenDaysInMs;

  if (lastActiveTime < timeSevenDaysAgo) {
    return UserStatusFilterOptions.inactive;
  }
  return UserStatusFilterOptions.active;
};
