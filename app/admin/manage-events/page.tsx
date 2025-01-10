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

export default function ManageEvents() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsAppointment, setDetailsAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnap = await getDocs(appointmentsRef);
      const appointmentsData = appointmentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointmentsData);
    };

    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    fetchAppointments();
    fetchUsers();
  }, []);

  const handleEditParticipants = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleShowDetails = (appointment) => {
    setDetailsAppointment(appointment);
  };

  const handleSaveParticipants = async () => {
    if (selectedAppointment) {
      const appointmentRef = doc(db, "appointments", selectedAppointment.id);
      const updates = {
        altarServerId: selectedAppointment.altarServer || null,
        altarServerPresidentId:
          selectedAppointment.altarServerPresident || null,
        priestId: selectedAppointment.priest || [],
      };

      await updateDoc(appointmentRef, updates);
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnap = await getDocs(appointmentsRef);
      const appointmentsData = appointmentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentsData);
      setSelectedAppointment(null);
    }
  };

  const handleSelectParticipant = (role, userId) => {
    if (!selectedAppointment) return;

    if (role === "priest") {
      selectedAppointment.priest = userId;
    } else if (role === "altarServer") {
      selectedAppointment.altarServer = userId;
    } else if (role === "altarServerPresident") {
      selectedAppointment.altarServerPresident = userId;
    }

    setSelectedAppointment({ ...selectedAppointment });
  };

  const getParticipantName = (role) => {
    const participantId = selectedAppointment
      ? selectedAppointment[role]
      : null;
    const participant = users.find((user) => user.id === participantId);
    return participant
      ? `${participant.firstName} ${participant.lastName}`
      : null;
  };

  const participantButtonText = (role) => {
    const participantName = getParticipantName(role);
    return participantName
      ? participantName
      : `Select ${role.charAt(0).toUpperCase() + role.slice(1)}`;
  };

  const hasParticipants = (appointment) => {
    return (
      appointment.priest?.length > 0 ||
      appointment.altarServer ||
      appointment.altarServerPresident
    );
  };

  const renderDetails = (appointment) => {
    switch (appointment.appointmentType) {
      case "baptismal":
        const baptismalDetails = appointment?.baptismal.child;
        return (
          <div>
            {baptismalDetails?.dateOfBirth && (
              <p className="w-max">
                <strong>Child Date of Birth:</strong>{" "}
                {new Date(baptismalDetails.dateOfBirth).toLocaleDateString()}
              </p>
            )}
            {baptismalDetails?.godMothers?.length > 0 && (
              <p className="w-max">
                <strong>God Mothers:</strong>{" "}
                {baptismalDetails.godMothers
                  .map(
                    (godMother) =>
                      `${godMother.firstName} ${godMother.lastName}`
                  )
                  .join(", ")}
              </p>
            )}
            {baptismalDetails?.godFathers?.length > 0 && (
              <p className="w-max">
                <strong>God Fathers:</strong>{" "}
                {baptismalDetails.godFathers
                  .map(
                    (godFather) =>
                      `${godFather.firstName} ${godFather.lastName}`
                  )
                  .join(", ")}
              </p>
            )}
          </div>
        );
      case "wedding":
        const weddingDetails = appointment?.wedding;
        return (
          <div className="flex gap-x-10">
            <div>
              <h3 className="text-lg font-bold">Bride Details</h3>
              <div className="mt-4">
                <p className="w-max">
                  <strong>Name:</strong>{" "}
                  {`${weddingDetails.bride.name.firstName} ${weddingDetails.bride.name.lastName}`}
                </p>
                {weddingDetails.bride.dateOfBirth && (
                  <p className="w-max">
                    <strong>Date of Birth:</strong>{" "}
                    {new Date(
                      weddingDetails.bride.dateOfBirth
                    ).toLocaleDateString()}
                  </p>
                )}
                <p className="w-max">
                  <strong>Address:</strong> {weddingDetails.bride.address}
                </p>
                <p className="w-max">
                  <strong>Citizenship:</strong>{" "}
                  {weddingDetails.bride.citizenship}
                </p>
                <p className="w-max">
                  <strong>Civil Status:</strong>{" "}
                  {weddingDetails.bride.civilStatus}
                </p>
                <p className="w-max">
                  <strong>Occupation:</strong> {weddingDetails.bride.occupation}
                </p>
                <p className="w-max">
                  <strong>Place of Birth:</strong>{" "}
                  {weddingDetails.bride.placeOfBirth}
                </p>
                <p className="w-max">
                  <strong>Religion:</strong> {weddingDetails.bride.religion}
                </p>
                <p className="w-max">
                  <strong>Father's Name:</strong>{" "}
                  {`${weddingDetails.bride.father.firstName} ${weddingDetails.bride.father.lastName}`}
                </p>
                <p className="w-max">
                  <strong>Mother's Name:</strong>{" "}
                  {`${weddingDetails.bride.mother.firstName} ${weddingDetails.bride.mother.lastName}`}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Groom Details</h3>
              <div className="mt-4">
                <p className="w-max">
                  <strong>Name:</strong>{" "}
                  {`${weddingDetails.groom.name.firstName} ${weddingDetails.groom.name.lastName}`}
                </p>
                {weddingDetails.groom.dateOfBirth && (
                  <p className="w-max">
                    <strong>Date of Birth:</strong>{" "}
                    {new Date(
                      weddingDetails.groom.dateOfBirth
                    ).toLocaleDateString()}
                  </p>
                )}
                <p className="w-max">
                  <strong>Address:</strong> {weddingDetails.groom.address}
                </p>
                <p className="w-max">
                  <strong>Citizenship:</strong>{" "}
                  {weddingDetails.groom.citizenship}
                </p>
                <p className="w-max">
                  <strong>Civil Status:</strong>{" "}
                  {weddingDetails.groom.civilStatus}
                </p>
                <p className="w-max">
                  <strong>Occupation:</strong> {weddingDetails.groom.occupation}
                </p>
                <p className="w-max">
                  <strong>Place of Birth:</strong>{" "}
                  {weddingDetails.groom.placeOfBirth}
                </p>
                <p className="w-max">
                  <strong>Religion:</strong> {weddingDetails.groom.religion}
                </p>
                <p className="w-max">
                  <strong>Father's Name:</strong>{" "}
                  {`${weddingDetails.groom.father.firstName} ${weddingDetails.groom.father.lastName}`}
                </p>
                <p className="w-max">
                  <strong>Mother's Name:</strong>{" "}
                  {`${weddingDetails.groom.mother.firstName} ${weddingDetails.groom.mother.lastName}`}
                </p>
              </div>
            </div>
          </div>
        );
      case "confirmation":
        const confirmationDetails = appointment?.confirmation.confirmant;
        return (
          <div>
            {confirmationDetails && (
              <div>
                <p>
                  <strong>Name:</strong>{" "}
                  {`${confirmationDetails.name.firstName} ${confirmationDetails.name.lastName}`}
                </p>
                {confirmationDetails.dateOfBirth && (
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {new Date(
                      confirmationDetails.dateOfBirth
                    ).toLocaleDateString()}
                  </p>
                )}
                <p>
                  <strong>Contact Number:</strong>{" "}
                  {confirmationDetails.contactNumber}
                </p>
              </div>
            )}
          </div>
        );
      case "burial":
        const burialDetails = appointment?.burial.deceased;
        return (
          <div>
            {burialDetails?.dateOfBirth && (
              <p className="w-max">
                <strong>Date of Birth:</strong>{" "}
                {new Date(burialDetails.dateOfBirth).toLocaleDateString()}
              </p>
            )}
            {burialDetails?.dateOfDeath && (
              <p className="w-max">
                <strong>Date of Death:</strong>{" "}
                {new Date(burialDetails.dateOfDeath).toLocaleDateString()}
              </p>
            )}
            {burialDetails?.name && (
              <p className="w-max">
                <strong>Name:</strong>{" "}
                {`${burialDetails.name.firstName} ${burialDetails.name.lastName}`}
              </p>
            )}
            {burialDetails?.representativeContactNumber && (
              <p className="w-max">
                <strong>Representative Contact Number:</strong>{" "}
                {burialDetails.representativeContactNumber}
              </p>
            )}
          </div>
        );
      case "houseBlessing":
        const houseBlessingDetails = appointment?.houseBlessing.appointee;
        return (
          <div>
            {houseBlessingDetails && (
              <div>
                <p>
                  <strong>Name:</strong>{" "}
                  {`${houseBlessingDetails.name.firstName} ${houseBlessingDetails.name.lastName}`}
                </p>
                <p>
                  <strong>Contact Number:</strong>{" "}
                  {houseBlessingDetails.contactNumber}
                </p>
                <p>
                  <strong>House Address:</strong>{" "}
                  {houseBlessingDetails.houseAddress}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-4">Manage Events</h1>
      <ul className="w-full flex flex-col">
        {appointments.map((appointment) => (
          <li
            key={appointment.id}
            className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
          >
            <div className="flex w-full items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">
                  {formatAppointmentType(appointment.appointmentType)}
                </h2>
                <p>
                  {formatDate(new Date(appointment.date).toLocaleDateString())}
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
                <Button
                  variant="outline"
                  onClick={() => handleEditParticipants(appointment)}
                  className="ml-2"
                >
                  {hasParticipants(appointment) ? <UserPen /> : <UserPen />}{" "}
                  {hasParticipants(appointment)
                    ? "Edit Participants"
                    : "Add Participants"}
                </Button>
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
                      {participantButtonText("priest")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {users
                      .filter((user) => user.role === "priest")
                      .map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onSelect={(event) => {
                            event.preventDefault();
                            handleSelectParticipant("priest", user.id);
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" className="w-full">
                      {participantButtonText("altarServer")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {users
                      .filter((user) => user.role === "altarServer")
                      .map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onSelect={(event) => {
                            event.preventDefault();
                            handleSelectParticipant("altarServer", user.id);
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline" className="w-full">
                      {participantButtonText("altarServerPresident")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {users
                      .filter((user) => user.role === "altarServerPresident")
                      .map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onSelect={(event) => {
                            event.preventDefault();
                            handleSelectParticipant(
                              "altarServerPresident",
                              user.id
                            );
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={handleSaveParticipants}>Save Changes</Button>
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
        ))}
      </ul>
    </div>
  );
}
