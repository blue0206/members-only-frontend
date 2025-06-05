import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
} from "@blue0206/members-only-shared-types";

/**
 * Sorts an array of messages according to the given sort option.
 *
 * @param {GetMessagesResponseDto | GetMessagesWithoutAuthorResponseDto} data
 * The array of messages to sort.
 * @param {SortOptionsType} sortOption
 * The method to sort the messages by.
 * @returns {GetMessagesResponseDto | GetMessagesWithoutAuthorResponseDto}
 * The sorted array of messages.
 */
export default function sortMessages<
  MessageListType extends
    | GetMessagesResponseDto
    | GetMessagesWithoutAuthorResponseDto
>(data: MessageListType, sortOption: SortOptionsType): MessageListType {
  const sortedData = [...data].sort((a, b) => {
    switch (sortOption) {
      case SortOptions.oldest:
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case SortOptions.newest:
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      case SortOptions.mostLikes:
        return b.likes - a.likes;
      case SortOptions.mostBookmarks:
        return b.bookmarks - a.bookmarks;
      default:
        return 0;
    }
  });

  return sortedData as MessageListType;
}

export const SortOptions = {
  newest: "newest",
  oldest: "oldest",
  mostLikes: "most-likes",
  mostBookmarks: "most-bookmarks",
} as const;
export type SortOptionsType = (typeof SortOptions)[keyof typeof SortOptions];
