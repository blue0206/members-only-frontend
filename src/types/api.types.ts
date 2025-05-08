import {
  EditMessageRequestDto,
  MessageParamsDto,
} from "@blue0206/members-only-shared-types";

// Export "editMessage" endpoint query type.
export interface EditMessageEndpointQueryType {
  newMessage: EditMessageRequestDto["newMessage"];
  messageId: MessageParamsDto["messageId"];
}
