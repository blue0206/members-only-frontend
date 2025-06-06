import {
  EditMessageRequestDto,
  MessageParamsDto,
  SetRoleRequestQueryDto,
  UsernameParamsDto,
} from "@blue0206/members-only-shared-types";

// Export "editMessage" endpoint query type.
export interface EditMessageEndpointQueryType {
  messageBody: EditMessageRequestDto;
  messageId: MessageParamsDto["messageId"];
}

// Export "deleteUser" endpoint query type.
export interface DeleteUserEndpointQueryType {
  username: UsernameParamsDto["username"] | null;
}

// Export "setRole" endpoint query type.
export interface SetRoleEndpointQueryType {
  username: UsernameParamsDto["username"];
  role: SetRoleRequestQueryDto["role"];
}
