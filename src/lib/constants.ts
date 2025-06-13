import { Role } from "@blue0206/members-only-shared-types";

export const SortOptions = {
  newest: "newest",
  oldest: "oldest",
  mostLikes: "most-likes",
  mostBookmarks: "most-bookmarks",
} as const;
export type SortOptionsType = (typeof SortOptions)[keyof typeof SortOptions];

export const RoleFilterOptions = {
  all: "all",
  user: Role.USER,
  member: Role.MEMBER,
  admin: Role.ADMIN,
} as const;
export type RoleFilterOptionsType =
  (typeof RoleFilterOptions)[keyof typeof RoleFilterOptions];

export const UserStatusFilterOptions = {
  all: "all",
  active: "active",
  inactive: "inactive",
} as const;
export type UserStatusFilterOptionsType =
  (typeof UserStatusFilterOptions)[keyof typeof UserStatusFilterOptions];

export const sessionExpiredQuery = "SESSION_EXPIRED";
export const unauthorizedRedirectionQuery = "UNAUTHORIZED";
