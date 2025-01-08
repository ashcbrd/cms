export function formatRole(role: string) {
  switch (role) {
    case "admin":
      return "Admin";
    case "parishioner":
      return "Parishioner";
    case "priest":
      return "Priest";
    case "altarServerPresident":
      return "Altar Server President";
    case "alterServer":
      return "Altar Server";
  }
}
