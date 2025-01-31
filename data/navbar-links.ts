import {
  LayoutDashboard,
  Calendar,
  UserCog,
  CalendarCog,
  MessageSquareQuote,
  BadgeInfo,
  CalendarCheck,
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
  {
    label: "Manage Appointments",
    url: "/admin/manage-appointments",
    icon: CalendarCog,
  },
  { label: "Manage Events", url: "/admin/manage-events", icon: CalendarCog },
  {
    label: "Parishioner Feedbacks",
    url: "/admin/parishioner-feedbacks",
    icon: MessageSquareQuote,
  },
  {
    label: "Verification Requests",
    url: "/admin/verification-requests",
    icon: BadgeInfo,
  },
];

export const priestNavbarLinks = [
  {
    label: "Appointments",
    url: "/priest/appointments",
    icon: Calendar,
  },
];

export const altarServerNavbarLinks = [
  {
    label: "Appointments",
    url: "/altar-server/appointments",
    icon: Calendar,
  },
  {
    label: "Attendance",
    url: "/altar-server/attendance",
    icon: CalendarCheck,
  },
];

export const altarServerPresidentNavbarLinks = [
  {
    label: "Appointments",
    url: "/altar-server-president/appointments",
    icon: Calendar,
  },
  {
    label: "Attendance",
    url: "/altar-server-president/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Altar Servers Attendance",
    url: "/altar-server-president/altar-servers-attendance",
    icon: CalendarCheck,
  },
];
