import {
  LayoutDashboard,
  Calendar,
  UserCog,
  CalendarCog,
  MessageSquareQuote,
} from "lucide-react";

export const parishionerNavbarLinks = [
  {
    label: "Dashboard",
    url: "/parishioner/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Appointments",
    url: "/parishioner/appointments",
    icon: Calendar,
  },
];

export const adminNavbarLinks = [
  {
    label: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  { label: "Manage Accounts", url: "/admin/manage-accounts", icon: UserCog },
  { label: "Manage Events", url: "/admin/manage-events", icon: CalendarCog },
  {
    label: "Manage Appointments",
    url: "/admin/manage-appointments",
    icon: CalendarCog,
  },
  {
    label: "Parishioner Feedbacks",
    url: "/admin/parishioner-feedbacks",
    icon: MessageSquareQuote,
  },
];
