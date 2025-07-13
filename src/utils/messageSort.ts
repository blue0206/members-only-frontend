import { SortOptions, SortOptionsType } from "@/lib/constants";
import {
  GetMessagesResponseDto,
  GetMessagesWithoutAuthorResponseDto,
} from "@blue0206/members-only-shared-types/dtos/message.dto";
import { GetUserBookmarksResponseDto } from "@blue0206/members-only-shared-types/dtos/user.dto";

/**
 * Sorts an array of messages according to the given sort option.
 *
 * @param {GetMessagesResponseDto | GetMessagesWithoutAuthorResponseDto | GetUserBookmarksResponseDto} data
 * The array of messages to sort.
 * @param {SortOptionsType} sortOption
 * The method to sort the messages by.
 * @returns {GetMessagesResponseDto | GetMessagesWithoutAuthorResponseDto | GetUserBookmarksResponseDto}
 * The sorted array of messages.
 */
export default function sortMessages<
  MessageListType extends
    | GetMessagesResponseDto
    | GetMessagesWithoutAuthorResponseDto
    | GetUserBookmarksResponseDto
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
