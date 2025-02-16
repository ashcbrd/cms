"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase";
import { collection, query, getDocs, doc, setDoc } from "firebase/firestore";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, differenceInMinutes } from "date-fns";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
  const [timeInModalOpen, setTimeInModalOpen] = useState(false);
  const [timeOutModalOpen, setTimeOutModalOpen] = useState(false);
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const attendanceCollectionRef = collection(db, "attendance");

  const getAttendances = useCallback(async () => {
    try {
      const q = query(attendanceCollectionRef);
      const querySnapshot = await getDocs(q);
      const attendancesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // @ts-ignore
      setAttendances(attendancesArray);
      const today = new Date().setHours(0, 0, 0, 0);
      const todaysAttendance = attendancesArray.find(
        (att) =>
          // @ts-ignore
          new Date(att.date.seconds * 1000).setHours(0, 0, 0, 0) === today &&
          // @ts-ignore
          att.userId === auth.currentUser.uid
      );
      if (todaysAttendance) {
        // @ts-ignore
        setHasCheckedIn(!!todaysAttendance.timeIn);
        // @ts-ignore
        setHasCheckedOut(!!todaysAttendance.timeOut);
        // @ts-ignore
        if (todaysAttendance.timeIn) {
          // @ts-ignore
          setCurrentAttendanceId(todaysAttendance.id);
          // @ts-ignore
          setTimeIn(todaysAttendance.timeIn);
        }
        // @ts-ignore
        if (todaysAttendance.timeOut) {
          // @ts-ignore
          setTimeOut(todaysAttendance.timeOut);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance: ", error);
    }
  }, [attendanceCollectionRef]);

  useEffect(() => {
    getAttendances();
  }, [getAttendances]);

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

  const handleTimeIn = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to record your attendance.");
      return;
    }

    const currentTime = new Date();
    const formattedTimeIn = format(currentTime, "hh:mm a");
    setTimeIn(formattedTimeIn);

    try {
      const attendanceRef = doc(attendanceCollectionRef);
      await setDoc(attendanceRef, {
        date: currentTime,
        timeIn: formattedTimeIn,
        userId: currentUser.uid,
        attendanceId: attendanceRef.id,
      });
      // @ts-ignore
      setCurrentAttendanceId(attendanceRef.id);
      setHasCheckedIn(true);
      setTimeInModalOpen(false);
      getAttendances();
    } catch (error) {
      // @ts-ignore
      console.error("Error saving time in: ", error.message, error);
    }
  };

  const handleTimeOut = async () => {
    const currentTime = new Date();
    const formattedTimeOut = format(currentTime, "hh:mm a");
    setTimeOut(formattedTimeOut);

    try {
      await setDoc(
        // @ts-ignore
        doc(attendanceCollectionRef, currentAttendanceId),
        {
          timeOut: formattedTimeOut,
        },
        { merge: true }
      );

      const { hours: inHours, minutes: inMinutes } = parseTime(timeIn);
      const timeInDate = new Date(currentTime);
      timeInDate.setHours(inHours);
      timeInDate.setMinutes(inMinutes);

      setHasCheckedOut(true);
      setTimeOutModalOpen(false);
      getAttendances();
    } catch (error) {
      // @ts-ignore
      console.error("Error saving time out: ", error.message, error);
    }
  };

  return (
    <div className="mx-auto p-4 flex w-full gap-x-10">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4">Your Attendance</h1>
        <p>Today's Date: {format(new Date(), "PPP")}</p>
        {!hasCheckedOut ? (
          <div className="flex flex-col gap-y-2 mt-4">
            <Dialog open={timeInModalOpen} onOpenChange={setTimeInModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  onClick={() => setTimeInModalOpen(true)}
                  disabled={hasCheckedIn}
                >
                  {timeIn ? `You timed in at: ${timeIn}` : "Time in"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Time In</DialogTitle>
                </DialogHeader>
                <p>
                  Your time in is:{" "}
                  <span className="font-bold">
                    {format(new Date(), "hh:mm a 'on' MMMM dd, yyyy")}
                  </span>
                </p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleTimeIn}>Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={timeOutModalOpen} onOpenChange={setTimeOutModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={"outline"}
                  onClick={() => setTimeOutModalOpen(true)}
                  disabled={!hasCheckedIn}
                >
                  {!timeIn
                    ? "Time out (disabled): You haven't timed in yet."
                    : "Time out"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Time Out</DialogTitle>
                </DialogHeader>
                <p>
                  Your time out is:{" "}
                  <span className="font-bold">
                    {format(new Date(), "hh:mm a 'on' MMMM dd, yyyy")}
                  </span>
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleTimeOut}
                    disabled={!currentAttendanceId}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 border border-zinc-300 rounded mt-4">
            <h2 className="text-lg font-bold">
              Your attendance for today has been recorded.
            </h2>
            <p>Date: {format(new Date(), "PPP")}</p>
            <p>Time In: {timeIn}</p>
            <p>Time Out: {timeOut}</p>
            <p>
              Total Hours:{" "}
              {attendances
                // @ts-ignore
                .filter((att) => att.id === currentAttendanceId)
                .map((attendance) => {
                  // @ts-ignore
                  const attendanceDate = attendance.date?.toDate();
                  const { hours: inHours, minutes: inMinutes } = parseTime(
                    // @ts-ignore
                    attendance.timeIn || "00:00 AM"
                  );
                  const { hours: outHours, minutes: outMinutes } = parseTime(
                    // @ts-ignore
                    attendance.timeOut || "00:00 AM"
                  );

                  const timeInDate = new Date(attendanceDate);
                  timeInDate.setHours(inHours);
                  timeInDate.setMinutes(inMinutes);

                  const timeOutDate = new Date(attendanceDate);
                  timeOutDate.setHours(outHours);
                  timeOutDate.setMinutes(outMinutes);

                  const totalMinutes = differenceInMinutes(
                    timeOutDate,
                    timeInDate
                  );
                  const calculatedTotalHours =
                    totalMinutes >= 0 ? totalMinutes / 60 : 0;
                  return calculatedTotalHours.toFixed(2);
                })}
            </p>
          </div>
        )}
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
                  <th className="px-4 py-2">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendances
                  .filter(
                    // @ts-ignore
                    (attendance) => attendance.userId === auth.currentUser?.uid
                  )
                  .map((attendance) => {
                    // @ts-ignore
                    const attendanceDate = attendance.date?.toDate();
                    // @ts-ignore
                    const timeIn = attendance.timeIn;
                    // @ts-ignore
                    const timeOut = attendance.timeOut;

                    const { hours: inHours, minutes: inMinutes } = parseTime(
                      timeIn || "00:00 AM"
                    );
                    const { hours: outHours, minutes: outMinutes } = parseTime(
                      timeOut || "00:00 AM"
                    );

                    const timeInDate = new Date(attendanceDate);
                    timeInDate.setHours(inHours);
                    timeInDate.setMinutes(inMinutes);

                    const timeOutDate = new Date(attendanceDate);
                    timeOutDate.setHours(outHours);
                    timeOutDate.setMinutes(outMinutes);

                    const totalMinutes = differenceInMinutes(
                      timeOutDate,
                      timeInDate
                    );
                    const calculatedTotalHours =
                      totalMinutes >= 0 ? totalMinutes / 60 : 0;

                    return (
                      <tr
                        key={
                          // @ts-ignore
                          attendance.id
                        }
                      >
                        <td className="border px-4 py-2 text-center">
                          {attendanceDate
                            ? format(attendanceDate, "PPP")
                            : "N/A"}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {timeIn}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {timeOut}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {calculatedTotalHours.toFixed(2)}
                        </td>
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
