import {
  EditUserRequestDto,
  RegisterRequestDto,
} from "@blue0206/members-only-shared-types";

export default function convertToFormData(
  body: RegisterRequestDto | EditUserRequestDto
): FormData {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, value as string);
  });
  return formData;
}
