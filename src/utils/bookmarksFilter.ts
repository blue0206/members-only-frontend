import { GetUserBookmarksResponseDto } from "@blue0206/members-only-shared-types/dtos/user.dto";

export default function bookmarksFilter(
  data: GetUserBookmarksResponseDto,
  searchQuery: string
): GetUserBookmarksResponseDto {
  return data.filter((bookmark) => {
    const messageMatch = bookmark.message
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    let authorMatch = false;
    if (bookmark.user) {
      authorMatch =
        bookmark.user.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        bookmark.user.firstname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (bookmark.user.middlename ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (bookmark.user.lastname ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
    }

    return messageMatch || authorMatch;
  });
}
