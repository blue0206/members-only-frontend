export const SortOptions = {
  newest: "newest",
  oldest: "oldest",
  mostLikes: "most-likes",
  mostBookmarks: "most-bookmarks",
} as const;
export type SortOptionsType = (typeof SortOptions)[keyof typeof SortOptions];
