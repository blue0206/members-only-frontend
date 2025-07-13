import {
  SetRoleRequestQueryDto,
  UsernameParamsDto,
} from "@blue0206/members-only-shared-types/dtos/user.dto";
import {
  EditMessageRequestDto,
  MessageParamsDto,
} from "@blue0206/members-only-shared-types/dtos/message.dto";

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
