import {
  EditMessageRequestDto,
  MessageParamsDto,
  UsernameParamsDto,
} from "@blue0206/members-only-shared-types";

// Export "editMessage" endpoint query type.
export interface EditMessageEndpointQueryType {
  newMessage: EditMessageRequestDto["newMessage"];
  messageId: MessageParamsDto["messageId"];
}

// Export "deleteUser" endpoint query type.
export interface DeleteUserEndpointQueryType {
  username: UsernameParamsDto["username"] | null;
}
