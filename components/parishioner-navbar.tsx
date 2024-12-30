"use client";

import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";
import { useEffect, useState } from "react";
import { parishionerNavbarLinks } from "@/data/parishioner-navbar-links";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";

const ParishionerNavbar = () => {
  const [userDetails, setUserDetails] = useState<{
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserDetails({
            firstName: data.firstName,
            lastName: data.lastName,
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

  return (
    <div className="p-x-10 h-full fixed w-[280px] p-10">
      <div>
        {userDetails ? (
          <div>
            <div className="flex items-center gap-x-2">
              <div className="min-w-10 text-white min-h-10 rounded-full flex items-center justify-center border border-[#bf6537] bg-primary">
                {userDetails.firstName && userDetails.firstName[0]}
                {userDetails.lastName && userDetails.lastName[0]}
              </div>
              <div>
                <h2 className="w-max font-semibold">
                  {userDetails.firstName} {userDetails.lastName}
                </h2>
                <p className="text-sm text-zinc-600">{userDetails.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <ul className="mt-10 flex flex-col gap-y-4">
          {parishionerNavbarLinks.map((item, index) => {
            const isActive = pathname === item.url;

            return (
              <li key={index}>
                <a
                  className={`flex gap-x-2 items-center hover:bg-zinc-100 w-full px-2 py-1 rounded-md ${
                    isActive && "bg-accent"
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
