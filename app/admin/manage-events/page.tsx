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
            //@ts-ignore
            appointment.status !== "Pending" && appointment.status !== "Denied"
        );
      //@ts-ignore
      setAppointments(appointmentsData);

      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      //@ts-ignore
      setUsers(usersData);
    };

    fetchAppointmentsAndUsers();
  }, []);

  //@ts-ignore
  const handleEditParticipants = (appointment) => {
    setSelectedAppointment(appointment);
    setTempParticipants({
      priest: appointment.priestId || null,
      altarServer: appointment.altarServerId || null,
      altarServerPresident: appointment.altarServerPresidentId || null,
    });
  };

  //@ts-ignore
  const handleShowDetails = (appointment) => {
    setDetailsAppointment(appointment);
  };

  const handleSaveParticipants = async () => {
    if (selectedAppointment) {
      //@ts-ignore
      const appointmentRef = doc(db, "appointments", selectedAppointment.id);
      const updates = {
        //@ts-ignore
        altarServerId: tempParticipants.altarServer || null,
        //@ts-ignore
        altarServerPresidentId: tempParticipants.altarServerPresident || null,
        //@ts-ignore
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
          //@ts-ignore
          appointment.status !== "Pending" && appointment.status !== "Denied"
      );
    //@ts-ignore
    setAppointments(appointmentsData);
  };
  //@ts-ignore
  const handleConfirmAppointment = (appointment) => {
    setConfirmationAppointment(appointment); // Set confirmation state to the appointment being confirmed
  };

  const confirmAppointment = async () => {
    if (confirmationAppointment) {
      try {
        const appointmentRef = doc(
          db,
          "appointments",
          //@ts-ignore
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
  //@ts-ignore
  const handleSelectParticipant = (role, userId) => {
    setTempParticipants((prev) => ({ ...prev, [role]: userId }));
  };

  // @ts-ignore
  const getParticipantName = (role) => {
    //@ts-ignore
    const participantId = tempParticipants[role];
    //@ts-ignore
    const participant = users.find((user) => user.id === participantId);
    return participant
      ? //@ts-ignore
        `${participant.firstName} ${participant.lastName}`
      : `Select ${role.charAt(0).toUpperCase() + role.slice(1)}`;
  };
  //@ts-ignore
  const renderDetails = (appointment) => {
    switch (appointment.appointmentType) {
      case "baptismal":
        const baptismalDetails = appointment?.baptismal.child;
        return (
          <div>
            {baptismalDetails?.dateOfBirth && (
              <p className="w-max">
                <strong>Child Date of Birth:</strong>{" "}
                {new Date(
                  baptismalDetails.childDateOfBirth
                ).toLocaleDateString()}
              </p>
            )}
            {baptismalDetails?.godMothers &&
              baptismalDetails.godMothers.length > 0 && (
                <p className="w-max">
                  <strong>God Mothers:</strong>{" "}
                  {baptismalDetails.godMothers
                    .map(
                      //@ts-ignore
                      (godMother) =>
                        `${godMother.firstName} ${godMother.lastName}`
                    )
                    .join(", ")}
                </p>
              )}
            {baptismalDetails?.godFathers &&
              baptismalDetails.godFathers.length > 0 && (
                <p className="w-max">
                  <strong>God Fathers:</strong>{" "}
                  {baptismalDetails.godFathers
                    .map(
                      //@ts-ignore
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
                    {formatDate(
                      new Date(
                        weddingDetails.bride.dateOfBirth
                      ).toLocaleDateString()
                    )}
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
                    {formatDate(
                      new Date(
                        weddingDetails.groom.dateOfBirth
                      ).toLocaleDateString()
                    )}
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
                    {formatDate(
                      new Date(
                        confirmationDetails.dateOfBirth
                      ).toLocaleDateString()
                    )}
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
                {new Date(burialDetails.dateOfBirth).toLocaleString()}
              </p>
            )}
            {burialDetails?.dateOfDeath && (
              <p className="w-max">
                <strong>Date of Death:</strong>{" "}
                {new Date(burialDetails.dateOfDeath).toLocaleString()}
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

  const acceptedAppointments = appointments.filter(
    // @ts-ignore
    (app) => app.status === "Accepted"
  );
  const confirmedAppointments = appointments.filter(
    // @ts-ignore
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
                  key={
                    // @ts-ignore
                    appointment.id
                  }
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl">
                        {
                          // @ts-ignore
                          formatAppointmentType(appointment?.appointmentType)
                        }
                      </h2>
                      <p>
                        {formatDate(
                          // @ts-ignore
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
                      {
                        // @ts-ignore
                        appointment.status !== "Confirmed" && (
                          <Button
                            variant="outline"
                            onClick={() => handleEditParticipants(appointment)}
                            className="ml-2"
                          >
                            {getParticipantName("priest") !==
                            `Select Priest` ? (
                              <UserPen />
                            ) : (
                              <UserPen />
                            )}{" "}
                            {getParticipantName("priest") !== `Select Priest`
                              ? "Edit Participants"
                              : "Add Participants"}
                          </Button>
                        )
                      }
                      {
                        // @ts-ignore
                        appointment.status !== "Confirmed" && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleConfirmAppointment(appointment)
                            } // Opens the confirm appointment dialog
                            className="ml-2"
                          >
                            Confirm Appointment
                          </Button>
                        )
                      }
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
                            // @ts-ignore
                            .filter((user) => user.role === "priest")
                            .map((user) => (
                              <DropdownMenuItem
                                // @ts-ignore
                                key={user.id}
                                onSelect={() =>
                                  // @ts-ignore
                                  handleSelectParticipant("priest", user.id)
                                }
                              >
                                {
                                  // @ts-ignore
                                  user.firstName
                                }{" "}
                                {
                                  // @ts-ignore
                                  user.lastName
                                }
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
                            // @ts-ignore
                            .filter((user) => user.role === "altarServer")
                            .map((user) => (
                              <DropdownMenuItem
                                // @ts-ignore
                                key={user.id}
                                onSelect={() =>
                                  handleSelectParticipant(
                                    "altarServer",
                                    // @ts-ignore
                                    user.id
                                  )
                                }
                              >
                                {
                                  // @ts-ignore
                                  user.firstName
                                }{" "}
                                {
                                  // @ts-ignore
                                  user.lastName
                                }
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
                              // @ts-ignore
                              (user) => user.role === "altarServerPresident"
                            )
                            .map((user) => (
                              <DropdownMenuItem
                                // @ts-ignore
                                key={user.id}
                                onSelect={() =>
                                  handleSelectParticipant(
                                    "altarServerPresident",
                                    // @ts-ignore
                                    user.id
                                  )
                                }
                              >
                                {
                                  // @ts-ignore
                                  user.firstName
                                }{" "}
                                {
                                  // @ts-ignore
                                  user.lastName
                                }
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
                  // @ts-ignore
                  key={appointment.id}
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <h2 className="font-bold text-xl">
                        {
                          // @ts-ignore
                          formatAppointmentType(appointment?.appointmentType)
                        }
                      </h2>
                      <p>
                        {formatDate(
                          // @ts-ignore
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
