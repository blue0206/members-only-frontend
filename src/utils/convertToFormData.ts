import {
  EditUserRequestDto,
  RegisterRequestDto,
} from "@blue0206/members-only-shared-types";

// A utility that converts a request body to a FormData object if a file is present.
// Otherwise, the request body is returned as is.
export default function convertToFormData(
  body: RegisterRequestDto | EditUserRequestDto
): FormData | RegisterRequestDto | EditUserRequestDto {
  // If a file (avatar in this case) is present, convert to FormData.
  // This will make sure the request is sent as a multipart/form-data request.
  if (
    ("avatar" in body && body.avatar) ||
    ("newAvatar" in body && body.newAvatar)
  ) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    return formData;
  }

  // Return body as it is if no file is present.
  // This will make sure the request is sent as a application/json request.
  return body;
}
