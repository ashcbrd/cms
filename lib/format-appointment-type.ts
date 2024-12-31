export function formatAppointmentType(appointmentType: string) {
  switch (appointmentType) {
    case "baptismal":
      return "Baptismal";
    case "wedding":
      return "Wedding";
    case "confirmation":
      return "Confirmation";
    case "burial":
      return "Burial";
    case "houseBlessing":
      return "House Blessing";
  }
}
