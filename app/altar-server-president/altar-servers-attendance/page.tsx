"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { format, differenceInMinutes } from "date-fns";

export default function AltarServersAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchAttendances = async () => {
    const attendanceCollectionRef = collection(db, "attendance");
    const q = query(attendanceCollectionRef);
    const attendanceSnapshot = await getDocs(q);
    const attendancesArray = attendanceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // @ts-ignore
    setAttendances(attendancesArray);
  };

  const fetchUsers = async () => {
    const userCollectionRef = collection(db, "users");
    const userSnapshot = await getDocs(userCollectionRef);
    const usersArray = userSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // @ts-ignore
      .filter((user) => user.role === "altarServer");
    // @ts-ignore
    setUsers(usersArray);
  };

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
  }, []);
  // @ts-ignore
  const parseTime = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    // @ts-ignore
    if (modifier === "PM" && hours !== 12) hours += 12;
    // @ts-ignore
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  };
  // @ts-ignore
  const calculateTotalHours = (timeIn, timeOut, date) => {
    if (timeIn && timeOut) {
      const { hours: inHours, minutes: inMinutes } = parseTime(timeIn);
      const { hours: outHours, minutes: outMinutes } = parseTime(timeOut);

      const timeInDate = new Date(date);
      timeInDate.setHours(inHours);
      timeInDate.setMinutes(inMinutes);

      const timeOutDate = new Date(date);
      timeOutDate.setHours(outHours);
      timeOutDate.setMinutes(outMinutes);

      const totalMinutes = differenceInMinutes(timeOutDate, timeInDate);
      return totalMinutes >= 0 ? (totalMinutes / 60).toFixed(2) : "0.00";
    }
    return "0.00";
  };

  const groupedAttendances = attendances.reduce((acc, attendance) => {
    const { userId } = attendance;
    if (!acc[userId]) {
      // @ts-ignore
      acc[userId] = [];
    }
    // @ts-ignore
    acc[userId].push(attendance);
    return acc;
  }, {});

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-4">Altar Servers Attendance</h1>
      {users.length > 0 ? (
        <div className="overflow-x-auto w-full">
          {users.map((user) => {
            // @ts-ignore
            const userAttendances = groupedAttendances[user.id] || [];
            // @ts-ignore
            const userFullName = `${user.firstName} ${user.lastName}`;

            return (
              <div
                key={
                  // @ts-ignore
                  user.id
                }
                className="mb-6 bg-zinc-50 border px-4 py-2 rounded-md w-full"
              >
                <h2 className="text-xl font-semibold py-2">{userFullName}</h2>
                {userAttendances.length > 0 ? (
                  <table className="table-auto w-full mt-2 mb-4 bg-white border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-r">Date</th>
                        <th className="px-4 py-2 border-r">Time In</th>
                        <th className="px-4 py-2 border-r">Time Out</th>
                        <th className="px-4 py-2">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAttendances.map(
                        // @ts-ignore
                        (attendance) => {
                          const attendanceDate = attendance.date?.toDate();
                          const { timeIn, timeOut } = attendance;

                          const totalHours = calculateTotalHours(
                            timeIn,
                            timeOut,
                            attendanceDate
                          );

                          return (
                            <tr key={attendance.id}>
                              <td className="border px-4 py-2 text-center">
                                {attendanceDate
                                  ? format(attendanceDate, "PPP")
                                  : "N/A"}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {timeIn
                                  .replace(/ AM| PM/, "")
                                  .replace(":", ".") || "N/A"}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {timeOut
                                  .replace(/ AM| PM/, "")
                                  .replace(":", ".") || "N/A"}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {totalHours}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p>No recorded attendance for this altar server.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
