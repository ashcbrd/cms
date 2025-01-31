"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { UserPen, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function ManageEvents() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [confirmationAppointment, setConfirmationAppointment] = useState(null); // Separate state for confirmation dialog
  const [tempParticipants, setTempParticipants] = useState({});

  useEffect(() => {
    const fetchAppointmentsAndUsers = async () => {
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnap = await getDocs(appointmentsRef);
      const appointmentsData = appointmentsSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (appointment) =>
            appointment.status !== "Pending" && appointment.status !== "Denied"
        );
      setAppointments(appointmentsData);

      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    fetchAppointmentsAndUsers();
  }, []);

  const handleEditParticipants = (appointment) => {
    setSelectedAppointment(appointment);
    setTempParticipants({
      priest: appointment.priestId || null,
      altarServer: appointment.altarServerId || null,
      altarServerPresident: appointment.altarServerPresidentId || null,
    });
  };

  const handleShowDetails = (appointment) => {
    setDetailsAppointment(appointment);
  };

  const handleSaveParticipants = async () => {
    if (selectedAppointment) {
      const appointmentRef = doc(db, "appointments", selectedAppointment.id);
      const updates = {
        altarServerId: tempParticipants.altarServer || null,
        altarServerPresidentId: tempParticipants.altarServerPresident || null,
        priestId: tempParticipants.priest || null,
      };
      await updateDoc(appointmentRef, updates);
      fetchAppointments();
      setSelectedAppointment(null);
    }
  };

  const fetchAppointments = async () => {
    const appointmentsRef = collection(db, "appointments");
    const appointmentsSnap = await getDocs(appointmentsRef);
    const appointmentsData = appointmentsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (appointment) =>
          appointment.status !== "Pending" && appointment.status !== "Denied"
      );
    setAppointments(appointmentsData);
  };

  const handleConfirmAppointment = (appointment) => {
    setConfirmationAppointment(appointment); // Set confirmation state to the appointment being confirmed
  };

  const confirmAppointment = async () => {
    if (confirmationAppointment) {
      try {
        const appointmentRef = doc(
          db,
          "appointments",
          confirmationAppointment.id
        );
        await updateDoc(appointmentRef, { status: "Confirmed" });
        fetchAppointments();
        setConfirmationAppointment(null); // Reset the confirmation appointment after confirming
      } catch (error) {
        console.error("Error confirming appointment:", error);
      }
    }
  };

  const handleSelectParticipant = (role, userId) => {
    setTempParticipants((prev) => ({ ...prev, [role]: userId }));
  };

  const getParticipantName = (role) => {
    const participantId = tempParticipants[role];
    const participant = users.find((user) => user.id === participantId);
    return participant
      ? `${participant.firstName} ${participant.lastName}`
      : `Select ${role.charAt(0).toUpperCase() + role.slice(1)}`;
  };

  const renderDetails = (appointment) => {
    // ... [your existing renderDetails code remains unchanged] ...
  };

  const acceptedAppointments = appointments.filter(
    (app) => app.status === "Accepted"
  );
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "Confirmed"
  );

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-4">Manage Events</h1>
      <div className="flex flex-col w-full items-center">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-2">Accepted Appointments</h2>
          <ul className="w-full flex flex-col">
            {acceptedAppointments.length === 0 ? (
              <li className="w-full text-center">No Accepted Appointments</li>
            ) : (
              acceptedAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl">
                        {formatAppointmentType(appointment?.appointmentType)}
                      </h2>
                      <p>
                        {formatDate(
                          new Date(appointment?.date).toLocaleDateString()
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleShowDetails(appointment)}
                        className="ml-2"
                      >
                        <EyeIcon /> View Details
                      </Button>
                      {appointment.status !== "Confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleEditParticipants(appointment)}
                          className="ml-2"
                        >
                          {getParticipantName("priest") !== `Select Priest` ? (
                            <UserPen />
                          ) : (
                            <UserPen />
                          )}{" "}
                          {getParticipantName("priest") !== `Select Priest`
                            ? "Edit Participants"
                            : "Add Participants"}
                        </Button>
                      )}
                      {appointment.status !== "Confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleConfirmAppointment(appointment)} // Opens the confirm appointment dialog
                          className="ml-2"
                        >
                          Confirm Appointment
                        </Button>
                      )}
                    </div>
                  </div>
                  <Dialog
                    open={selectedAppointment === appointment}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedAppointment(null);
                      }
                    }}
                  >
                    <DialogContent className="flex flex-col p-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full">
                            {getParticipantName("priest")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {users
                            .filter((user) => user.role === "priest")
                            .map((user) => (
                              <DropdownMenuItem
                                key={user.id}
                                onSelect={() =>
                                  handleSelectParticipant("priest", user.id)
                                }
                              >
                                {user.firstName} {user.lastName}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full">
                            {getParticipantName("altarServer")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {users
                            .filter((user) => user.role === "altarServer")
                            .map((user) => (
                              <DropdownMenuItem
                                key={user.id}
                                onSelect={() =>
                                  handleSelectParticipant(
                                    "altarServer",
                                    user.id
                                  )
                                }
                              >
                                {user.firstName} {user.lastName}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" className="w-full">
                            {getParticipantName("altarServerPresident")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {users
                            .filter(
                              (user) => user.role === "altarServerPresident"
                            )
                            .map((user) => (
                              <DropdownMenuItem
                                key={user.id}
                                onSelect={() =>
                                  handleSelectParticipant(
                                    "altarServerPresident",
                                    user.id
                                  )
                                }
                              >
                                {user.firstName} {user.lastName}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button onClick={handleSaveParticipants}>
                        Save Changes
                      </Button>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={detailsAppointment === appointment}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDetailsAppointment(null);
                      }
                    }}
                  >
                    <DialogContent>{renderDetails(appointment)}</DialogContent>
                  </Dialog>
                </li>
              ))
            )}
          </ul>
        </div>
        <Separator className="mt-4" />
        <div className="w-full mt-6">
          <h2 className="text-xl font-semibold mb-2">Confirmed Appointments</h2>
          <ul className="w-full flex flex-col">
            {confirmedAppointments.length === 0 ? (
              <li className="w-full text-center">No Confirmed Appointments</li>
            ) : (
              confirmedAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl">
                        {formatAppointmentType(appointment?.appointmentType)}
                      </h2>
                      <p>
                        {formatDate(
                          new Date(appointment?.date).toLocaleDateString()
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleShowDetails(appointment)}
                        className="ml-2"
                      >
                        <EyeIcon /> View Details
                      </Button>
                    </div>
                  </div>
                  <Dialog
                    open={detailsAppointment === appointment}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDetailsAppointment(null);
                      }
                    }}
                  >
                    <DialogContent>{renderDetails(appointment)}</DialogContent>
                  </Dialog>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmationAppointment} // Open if confirmationAppointment is set
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationAppointment(null); // Reset appointment when closing dialog
          }
        }}
      >
        <DialogContent className="flex flex-col p-10">
          <h2 className="text-xl font-bold">Confirm Appointment</h2>
          <p className="mt-4">
            Are you sure you want to confirm this appointment?
          </p>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmationAppointment(null)} // Close dialog
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={confirmAppointment}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
