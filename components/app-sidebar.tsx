"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

const items = [
  {
    title: "Dashboard",
    url: "/parishioner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Appointments",
    url: "/parishioner/appointments",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
      } else {
        setEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex items-center gap-x-2 mb-10">
              <Avatar className="border">
                <AvatarFallback className="uppercase">
                  {email && email[0]}
                </AvatarFallback>
              </Avatar>
              <p>{email ? email : "Not logged in"}</p>
            </div>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a className="text-lg" href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
