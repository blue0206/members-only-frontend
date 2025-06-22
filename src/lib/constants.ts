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

export const ProfileSettingsTabOptions = {
  editProfile: "edit-profile",
  account: "account",
  sessions: "sessions",
  dangerZone: "danger-zone",
};
export type ProfileSettingsTabOptionsType =
  (typeof ProfileSettingsTabOptions)[keyof typeof ProfileSettingsTabOptions];

// All constants except desktop match the type returned by backend (ua-parser-js)
export const DeviceType = {
  desktop: "desktop",
  smarttv: "smarttv",
  mobile: "mobile",
  tablet: "tablet",
};
export type UserDeviceType = (typeof DeviceType)[keyof typeof DeviceType];

export const sessionExpiredQuery = "SESSION_EXPIRED";
export const unauthorizedRedirectionQuery = "UNAUTHORIZED";
export const serverErrorQuery = "SERVER_ERROR";
