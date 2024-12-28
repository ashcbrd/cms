"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Calendar } from "@/components/ui/calendar";
import React, { useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

const SetAppoinent = () => {
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await addDoc(collection(db, "appointments"), {
        appointmentType,
        date: date ? date.toISOString() : null, // Ensure date is a string
        dateOfBirth,
      });

      setSuccessMessage("Appointment added successfully!");
      setAppointmentType("");
      setDate(null);
      setDateOfBirth("");
    } catch (err: any) {
      setError("Error adding appointment: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded shadow">
      <h2 className="text-lg font-bold mb-4">Schedule an Appointment</h2>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <DropdownMenu>
        <DropdownMenuTrigger>
          {appointmentType || "Select Appointment Type"}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Appointment Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAppointmentType("Type 1")}>
            Type 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAppointmentType("Type 2")}>
            Type 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAppointmentType("Type 3")}>
            Type 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mb-4">
        <label className="block mb-2">
          Date:
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="block mb-2">
          Date of Birth:
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </label>
      </div>

      <button
        type="submit"
        className="w-full p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
      >
        Schedule Appointment
      </button>
    </form>
  );
};

export default SetAppoinent;
