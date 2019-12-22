import { UserType } from "../../constants";

export function userTypeToText(type: UserType): string {
  switch (type) {
    case UserType.student:
      return "Estudiante";
    case UserType.scientificOrAcademic:
      return "Científic@ y/o académic@";
    case UserType.professional:
      return "Profesional";
    case UserType.other:
    default:
      return "Otros";
  }
}
