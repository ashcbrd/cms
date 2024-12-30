"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { auth } from "@/firebase";

import "./custom-calendar.css";

const DashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (auth.currentUser?.uid) {
          const appointmentsQuery = query(
            collection(db, "appointments"),
            where("userId", "==", auth.currentUser.uid)
          );

          const snapshot = await getDocs(appointmentsQuery);
          const appointmentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAppointments(appointmentsData);
        }
      } catch (err) {
        console.error("Error fetching appointments: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (app) => app.status === "Pending"
  ).length;
  const deniedAppointments = appointments.filter(
    (app) => app.status === "Denied"
  ).length;
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "Confirmed"
  ).length;

  useEffect(() => {
    const datesWithAppointments = appointments.map((app) => new Date(app.date));
    setHighlightedDates(datesWithAppointments);
  }, [appointments]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-md shadow-gray-400/10 border-[1px] border-gray-500/10 rounded-xl p-4">
            <h2 className="text-xl font-semibold">Total Appointments</h2>
            <p>{totalAppointments}</p>
          </div>
          <div className="bg-white shadow-md shadow-gray-400/10 border-[1px] border-gray-500/10 rounded-xl p-4">
            <h2 className="text-xl font-semibold">Pending Appointments</h2>
            <p>{pendingAppointments}</p>
          </div>
          <div className="bg-white shadow-md shadow-gray-400/10 border-[1px] border-gray-500/10 rounded-xl p-4">
            <h2 className="text-xl font-semibold">Denied Appointments</h2>
            <p>{deniedAppointments}</p>
          </div>
          <div className="bg-white shadow-md shadow-gray-400/10 border-[1px] border-gray-500/10 rounded-xl p-4">
            <h2 className="text-xl font-semibold">Confirmed Appointments</h2>
            <p>{confirmedAppointments}</p>
          </div>
          <div className="col-span-full bg-white shadow-md rounded-md p-4">
            <h2 className="text-xl font-semibold">Appointments Calendar</h2>
            <Calendar
              className="my-calendar mt-10"
              tileClassName={({ date }) =>
                highlightedDates.some(
                  (highlighted) =>
                    highlighted.toDateString() === date.toDateString()
                )
                  ? "highlighted"
                  : ""
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
