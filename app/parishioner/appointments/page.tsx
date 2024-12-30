"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase"; // Adjust the path as necessary
import { collection, getDocs } from "firebase/firestore";
import AppointmentCard from "@/components/appointment-card"; // Adjust the path as necessary

interface Appointment {
  id: string;
  appointmentType: string;
  status: string;
  date: string;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointmentCollection = collection(db, "appointments");
        const snapshot = await getDocs(appointmentCollection);
        const appointmentsData: Appointment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Appointment, "id">), // Ensure the correct type mapping
        }));
        setAppointments(appointmentsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold mb-4">My Appointments</h2>
        <a
          href="/parishioner/set-appointment"
          className="py-2 px-6 bg-primary rounded-md text-white hover:bg-hover transition-all"
        >
          Schedule an Appointment
        </a>
      </div>
      {loading && <p>Loading appointments...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {appointments.length === 0 && !loading && (
        <p>No appointments scheduled.</p>
      )}
      <div className="mt-10">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;
