"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase";
import { parishionerNavbarLinks } from "@/data/navbar-links";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { BadgeAlert, BadgeCheck, BadgeHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ParishionerNavbar = () => {
  const [userDetails, setUserDetails] = useState<{
    firstName: string | null;
    lastName: string | null;
    verificationStatus: string | null;
    email: string | null;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserDetails({
            firstName: data.firstName,
            lastName: data.lastName,
            verificationStatus: data.verificationStatus,
            email: user.email,
          });
        } else {
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
        setDialogOpen(false);
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <div className="p-x-10 h-full fixed w-[280px] p-10 border-r border-gray-300/40">
      <div>
        {userDetails ? (
          <div>
            <div className="flex gap-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-x-2">
                    <div className="min-w-10 text-white min-h-10 rounded-full flex items-center justify-center border border-[#bf6537] bg-primary">
                      {userDetails.firstName && userDetails.firstName[0]}
                      {userDetails.lastName && userDetails.lastName[0]}
                    </div>
                    <div>
                      <h2 className="w-max font-semibold">
                        {userDetails.firstName} {userDetails.lastName}
                      </h2>
                      <p className="text-sm text-zinc-600 w-max">
                        {userDetails.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Profile</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="font-semibold cursor-pointer"
                    onClick={() => setDialogOpen(true)}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="translate-y-[3px]">
                {userDetails.verificationStatus === "Verified" ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <BadgeCheck size={18} color="#93DC5C" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your account is verified.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : userDetails.verificationStatus === "Unverified" ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <BadgeAlert size={18} color="gray" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          You are not yet verified.{" "}
                          <span className="underline">
                            <a href="/parishioner/verification">Click here</a>
                          </span>{" "}
                          to verify.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <BadgeHelp size={18} color="gold" />
                )}
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to Log out?</DialogTitle>
                  <DialogDescription>
                    This will log you out of your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-all mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-primary hover:bg-hover transition-all text-white"
                  >
                    Confirm Logout
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex items-center gap-x-2">
            <div className="min-w-10 text-white min-h-10 rounded-full bg-gradient-to-tr from-zinc-300 via-zinc-100 to-zinc-300 opacity-30 animate-pulse" />
            <div className="flex flex-col gap-y-2">
              <div className="w-full h-4 bg-gradient-to-tr rounded-xl from-zinc-300 via-zinc-100 to-zinc-300 opacity-30 animate-pulse" />
              <div className="h-3 w-[140px] rounded-xl bg-gradient-to-tr from-zinc-300 via-zinc-100 to-zinc-300 opacity-30 animate-pulse" />
            </div>
          </div>
        )}
        <ul className="mt-10 flex flex-col gap-y-4">
          {parishionerNavbarLinks.map((item, index) => {
            const isActive = pathname === item.url;

            return (
              <li key={index}>
                <a
                  className={`flex gap-x-2 items-center hover:bg-zinc-100 w-full px-2 py-1 rounded-md ${
                    isActive ? "bg-accent" : ""
                  }`}
                  href={item.url}
                >
                  {React.createElement(item.icon, { size: 18 })} {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ParishionerNavbar;
