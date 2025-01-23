"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, query, getDocs, doc, setDoc } from "firebase/firestore";
import { auth } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function AttendancePage() {
  const [date, setDate] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [timeFormatIn, setTimeFormatIn] = useState("AM");
  const [timeFormatOut, setTimeFormatOut] = useState("AM");

  const attendanceCollectionRef = collection(db, "attendance");
  const q = query(attendanceCollectionRef);

  useEffect(() => {
    const getAttendances = async () => {
      try {
        const querySnapshot = await getDocs(q);
        const attendancesArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendances(attendancesArray);
      } catch (error) {
        console.error("Error fetching attendance: ", error);
      }
    };
    getAttendances();
  }, [q]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to record your attendance.");
      return;
    }

    if (timeIn && timeOut && date) {
      try {
        const attendanceRef = doc(attendanceCollectionRef);
        await setDoc(attendanceRef, {
          date: date,
          timeIn: timeIn + " " + timeFormatIn,
          timeOut: timeOut + " " + timeFormatOut,
          userId: currentUser.uid,
          attendanceId: attendanceRef.id,
        });

        setTimeIn("");
        setTimeOut("");
        setTimeFormatIn("AM");
        setTimeFormatOut("PM");
        setDate(null); // Reset date input
      } catch (error) {
        console.error("Error saving attendance: ", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="mx-auto p-4 flex w-full gap-x-10">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4">Your Attendance</h1>
        <form onSubmit={handleSubmit} className="grid gap-y-4 mb-4">
          <label className="label" htmlFor="date">
            Date:
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex gap-x-4">
            <div className="w-full">
              <label htmlFor="timeIn">Time In (HH:MM):</label>
              <Input
                id="timeIn"
                type="time"
                value={timeIn}
                onChange={(event) => setTimeIn(event.target.value)}
              />
            </div>
            <div className="w-full">
              <label htmlFor="timeOut">Time Out (HH:MM):</label>
              <Input
                id="timeOut"
                type="time"
                value={timeOut}
                onChange={(event) => setTimeOut(event.target.value)}
              />
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4">All Attendance</h1>
        {attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time In</th>
                  <th className="px-4 py-2">Time Out</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => {
                  const attendanceDate = attendance.date?.toDate();
                  return (
                    <tr key={attendance.id}>
                      <td className="border px-4 py-2">
                        {attendanceDate ? format(attendanceDate, "PPP") : "N/A"}
                      </td>
                      <td className="border px-4 py-2">{attendance.timeIn}</td>
                      <td className="border px-4 py-2">{attendance.timeOut}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No recorded attendance.</p>
        )}
      </div>
    </div>
  );
}
