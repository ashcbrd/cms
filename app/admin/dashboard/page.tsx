"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  CalendarX2,
} from "lucide-react";

const DashboardPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAppointments();
        await fetchUsers();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsQuery = collection(db, "appointments");
      const snapshot = await getDocs(appointmentsQuery);
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Error fetching appointments: ", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersQuery = collection(db, "users");
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users: ", err);
    }
  };

  const statuses = ["Pending", "Accepted", "Denied", "Confirmed"];

  const groupedAppointments = statuses.reduce((acc, status) => {
    acc[status] = appointments.filter((app) => app.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  const roleCounts = users.reduce((acc, user) => {
    if (user.role) {
      acc[user.role] = (acc[user.role] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Appointments</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-yellow-100 p-4 border rounded-lg shadow-md">
                <div className="flex items-center gap-x-2">
                  <CalendarClock />{" "}
                  <h2 className="text-xl">Pending Appointments</h2>
                </div>
                <p className="text-4xl">{groupedAppointments["Pending"]}</p>
              </div>
              <div className="bg-blue-100 p-4 border rounded-lg shadow-md">
                <div className="flex items-center gap-x-2">
                  <CalendarPlus />
                  <h2 className="text-xl">Accepted Appointments</h2>
                </div>
                <p className="text-4xl">{groupedAppointments["Accepted"]}</p>
              </div>
              <div className="bg-red-100 p-4 border rounded-lg shadow-md">
                <div className="flex items-center gap-x-2">
                  <CalendarX2 />
                  <h2 className="text-xl">Denied Appointments</h2>
                </div>
                <p className="text-4xl">{groupedAppointments["Denied"]}</p>
              </div>
              <div className="bg-green-100 p-4 border rounded-lg shadow-md">
                <div className="flex items-center gap-x-2">
                  <CalendarCheck2 />
                  <h2 className="text-xl">Confirmed Appointments</h2>
                </div>
                <p className="text-4xl">{groupedAppointments["Confirmed"]}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2 mt-10">Users</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Parishioners</h2>
                <p className="text-2xl">{roleCounts["parishioner"] || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Priests</h2>
                <p className="text-2xl">{roleCounts["priest"] || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Altar Servers</h2>
                <p className="text-2xl">{roleCounts["altarServer"] || 0}</p>
              </div>
              <div className="bg-white p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">
                  Altar Server Presidents
                </h2>
                <p className="text-2xl">
                  {roleCounts["altarServerPresident"] || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
