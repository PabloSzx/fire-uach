import { UserType } from "./";

export function userTypeToText(type?: UserType | null): string {
  switch (type) {
    case UserType.student:
      return "Estudiante";
    case UserType.scientificOrAcademic:
      return "Científic@ y/o académic@";
    case UserType.technicianOrProfessional:
      return "Técnico y/o Profesional";
    case UserType.corralHabitant:
      return "Habitante de Corral";
    case UserType.villaAlemanaHabitant:
      return "Habitante de Villa Alemana";
    case UserType.other:
      return "Otros";
    default:
      return "Indefinido";
  }
}
