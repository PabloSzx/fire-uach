import { UserType } from "../../constants";

export function userTypeToText(type?: UserType | null): string {
  switch (type) {
    case UserType.student:
      return "Estudiante";
    case UserType.scientificOrAcademic:
      return "Científic@ y/o académic@";
    case UserType.professional:
      return "Profesional";
    case UserType.other:
      return "Otros";
    default:
      return "Indefinido";
  }
}
