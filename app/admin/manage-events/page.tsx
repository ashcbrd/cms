"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { UserPen, EyeIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { formatRole } from "@/lib/format-role";

export default function ManageEvents() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [confirmationAppointment, setConfirmationAppointment] = useState(null);
  const [tempParticipants, setTempParticipants] = useState({});

  useEffect(() => {
    const fetchAppointmentsAndUsers = async () => {
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnap = await getDocs(appointmentsRef);
      const appointmentsData = appointmentsSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (appointment) =>
            // @ts-ignore
            appointment.status !== "Pending" && appointment.status !== "Denied"
        );
      // @ts-ignore
      setAppointments(appointmentsData);

      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // @ts-ignore
      setUsers(usersData);
    };

    fetchAppointmentsAndUsers();
  }, []);

  // @ts-ignore
  const handleEditParticipants = (appointment) => {
    setSelectedAppointment(appointment);
    setTempParticipants({
      priest: appointment.priestId || null,
      altarServer: appointment.altarServerId || null,
      altarServerPresident: appointment.altarServerPresidentId || null,
    });
  };

  // @ts-ignore
  const handleShowDetails = (appointment) => {
    setDetailsAppointment(appointment);
  };

  useEffect(() => {
    const sendSms = async (to: string, body: string) => {
      try {
        const response = await fetch("/api/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to, body }),
        });

        const result = await response.json();
        if (response.ok) {
          console.log("SMS sent successfully:", result);
        } else {
          console.error("Failed to send SMS:", result);
        }
      } catch (error) {
        console.error("Error sending SMS:", error);
      }
    };

    if (selectedAppointment) {
      const sendSmsToParticipants = async () => {
        const message =
          "Good day! You have been assigned to an event. Please open the app to view the details.";

        // @ts-ignore
        if (tempParticipants.priest) {
          const priest = users.find(
            // @ts-ignore
            (user) => user.id === tempParticipants.priest
          );
          // @ts-ignore
          if (priest && priest.contactNumber) {
            // @ts-ignore
            await sendSms(priest.contactNumber, message);
          }
        }
        // @ts-ignore
        if (tempParticipants.altarServer) {
          const altarServer = users.find(
            // @ts-ignore
            (user) => user.id === tempParticipants.altarServer
          );
          // @ts-ignore
          if (altarServer && altarServer.contactNumber) {
            // @ts-ignore
            await sendSms(altarServer.contactNumber, message);
          }
        }
        // @ts-ignore
        if (tempParticipants.altarServerPresident) {
          const altarServerPresident = users.find(
            // @ts-ignore
            (user) => user.id === tempParticipants.altarServerPresident
          );
          // @ts-ignore
          if (altarServerPresident && altarServerPresident.contactNumber) {
            // @ts-ignore
            await sendSms(altarServerPresident.contactNumber, message);
          }
        }
      };

      sendSmsToParticipants();
    }
  }, [selectedAppointment, tempParticipants, users]);

  const handleSaveParticipants = async () => {
    if (selectedAppointment) {
      // @ts-ignore
      const appointmentRef = doc(db, "appointments", selectedAppointment.id);
      const updates = {
        // @ts-ignore
        altarServerId: tempParticipants.altarServer || null,
        // @ts-ignore
        altarServerPresidentId: tempParticipants.altarServerPresident || null,
        // @ts-ignore
        priestId: tempParticipants.priest || null,
      };
      await updateDoc(appointmentRef, updates);

      // @ts-ignore
      const updateParticipantAvailability = async (userId) => {
        if (userId) {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, { available: false });
        }
      };

      // @ts-ignore
      await updateParticipantAvailability(tempParticipants.priest);
      // @ts-ignore
      await updateParticipantAvailability(tempParticipants.altarServer);
      await updateParticipantAvailability(
        // @ts-ignore
        tempParticipants.altarServerPresident
      );

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
          // @ts-ignore
          appointment.status !== "Pending" && appointment.status !== "Denied"
      );
    // @ts-ignore
    setAppointments(appointmentsData);
  };

  // @ts-ignore
  const handleConfirmAppointment = (appointment) => {
    setConfirmationAppointment(appointment);
  };

  const confirmAppointment = async () => {
    if (confirmationAppointment) {
      try {
        const appointmentRef = doc(
          db,
          "appointments",
          // @ts-ignore
          confirmationAppointment.id
        );
        await updateDoc(appointmentRef, { status: "Confirmed" });

        // @ts-ignore
        const updateParticipantAvailability = async (userId) => {
          if (userId) {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { available: true });
          }
        };

        // @ts-ignore
        await updateParticipantAvailability(confirmationAppointment.priestId);

        await updateParticipantAvailability(
          // @ts-ignore
          confirmationAppointment.altarServerId
        );
        await updateParticipantAvailability(
          // @ts-ignore
          confirmationAppointment.altarServerPresidentId
        );

        fetchAppointments();
        setConfirmationAppointment(null);
      } catch (error) {
        console.error("Error confirming appointment:", error);
      }
    }
  };

  // @ts-ignore
  const handleSelectParticipant = (role, userId) => {
    setTempParticipants((prev) => ({ ...prev, [role]: userId }));
  };

  // @ts-ignore
  const getParticipantName = (role) => {
    // @ts-ignore
    const participantId = tempParticipants[role];
    // @ts-ignore
    const participant = users.find((user) => user.id === participantId);
    return participant
      ? // @ts-ignore
        `${participant?.firstName} ${participant?.lastName}`
      : `Select ${formatRole(role)}`;
  };

  // @ts-ignore
  const getCertificateLink = (appointment) => {
    const baseUrl = "/admin";
    switch (appointment.appointmentType) {
      case "baptismal":
        return `${baseUrl}/baptism-certificate?babyName=${
          appointment.baptismal.child.name?.firstName +
          " " +
          appointment.baptismal.child.name?.lastName
        }&baptismDate=${appointment.date}&priestName=${
          appointment.priestId
            ? users.find(
                (user) =>
                  // @ts-ignore
                  user.id === appointment.priestId
                // @ts-ignore
              )?.firstName +
              " " +
              // @ts-ignore
              users.find((user) => user.id === appointment.priestId)?.lastName
            : "Unknown Priest"
        }`;
      case "wedding":
        return `${baseUrl}/marriage-certificate?groomFirstName=${
          appointment.wedding.groom.name?.firstName
        }&groomLastName=${
          appointment.wedding.groom.name?.lastName
        }&brideFirstName=${
          appointment.wedding.bride.name?.firstName
        }&brideLastName=${
          appointment.wedding.bride.name?.lastName
        }&weddingDate=${appointment.date}&priestName=${
          appointment.priestId
            ? users.find(
                (user) =>
                  // @ts-ignore
                  user.id === appointment.priestId
                // @ts-ignore
              )?.firstName +
              " " +
              // @ts-ignore
              users.find((user) => user.id === appointment.priestId)?.lastName
            : "Unknown Priest"
        }`;
      case "confirmation":
        return `${baseUrl}/confirmation-certificate?parishionerName=${
          appointment.confirmation.confirmant.name?.firstName +
          " " +
          appointment.confirmation.confirmant.name?.lastName
        }&confirmationDate=${appointment.date}&priestName=${
          appointment.priestId
            ? // @ts-ignore
              users.find(
                (user) =>
                  // @ts-ignore
                  user.id === appointment.priestId
                // @ts-ignore
              )?.firstName +
              " " +
              // @ts-ignore
              users.find((user) => user.id === appointment.priestId)?.lastName
            : "Unknown Priest"
        }`;
      case "burial":
        return `${baseUrl}/death-certificate?deceasedName=${
          appointment.burial.deceased.name?.firstName +
          " " +
          appointment.burial.deceased.name?.lastName
        }&dateOfDeath=${appointment.date}&priestName=${
          appointment.priestId
            ? users.find(
                (user) =>
                  // @ts-ignore
                  user.id === appointment.priestId
                // @ts-ignore
              )?.firstName +
              " " +
              // @ts-ignore
              users.find((user) => user.id === appointment.priestId)?.lastName
            : "Unknown Priest"
        }`;
      case "houseBlessing":
        return `${baseUrl}/house-blessing-certificate?parishionerName=${
          appointment.houseBlessing.appointee.name?.firstName +
          " " +
          appointment.houseBlessing.appointee.name?.lastName
        }&houseBlessingDate=${appointment.date}&priestName=${
          appointment.priestId
            ? // @ts-ignore
              users.find(
                (user) =>
                  // @ts-ignore
                  user.id === appointment.priestId
                // @ts-ignore
              )?.firstName +
              " " +
              // @ts-ignore
              users.find((user) => user.id === appointment.priestId)?.lastName
            : "Unknown Priest"
        }`;
      default:
        return "#";
    }
  };

  // @ts-ignore
  const renderDetails = (appointment) => {
    const parishionerSection = (
      <div className="mb-6">
        <h3 className="text-xl font-bold">Appointment Setter</h3>
        <Separator className="my-2" />
        <div>
          {appointment.userId && (
            <p>
              <strong>Name:</strong> {/* @ts-ignore */}
              {users.find((user) => user.id === appointment.userId)
                ? `${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.userId)
                      .firstName
                  } ${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.userId)
                      .lastName
                  }`
                : "User not found"}
            </p>
          )}
        </div>
      </div>
    );

    const ministersSection = (
      <div className="mt-6">
        <h3 className="text-xl font-bold">Ministers</h3>
        <Separator className="my-2" />
        <div className="flex flex-col">
          {appointment.priestId && (
            <p>
              <strong>Priest:</strong> {/* @ts-ignore */}
              {users.find((user) => user.id === appointment.priestId)
                ? `${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.priestId)
                      .firstName
                  } ${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.priestId)
                      .lastName
                  }`
                : "Priest not found"}
            </p>
          )}
          {appointment.altarServerId && (
            <p>
              <strong>Altar Server:</strong> {/* @ts-ignore */}
              {users.find((user) => user.id === appointment.altarServerId)
                ? `${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.altarServerId)
                      .firstName
                  } ${
                    // @ts-ignore
                    users.find((user) => user.id === appointment.altarServerId)
                      .lastName
                  }`
                : "Altar Server not found"}
            </p>
          )}
          {appointment.altarServerPresidentId && (
            <p>
              <strong>Altar Server President:</strong>{" "}
              {users.find(
                // @ts-ignore
                (user) => user.id === appointment.altarServerPresidentId
              )
                ? `${
                    // @ts-ignore
                    users.find(
                      // @ts-ignore
                      (user) => user.id === appointment.altarServerPresidentId
                    ).firstName
                  } ${
                    // @ts-ignore
                    users.find(
                      // @ts-ignore
                      (user) => user.id === appointment.altarServerPresidentId
                    ).lastName
                  }`
                : "Altar Server President not found"}
            </p>
          )}
        </div>
      </div>
    );

    switch (appointment.appointmentType) {
      case "baptismal":
        const baptismalDetails = appointment?.baptismal.child;
        return (
          <div>
            {parishionerSection}
            {baptismalDetails?.dateOfBirth && (
              <p className="w-max">
                <strong>Child Date of Birth:</strong>{" "}
                {new Date(baptismalDetails.dateOfBirth).toLocaleDateString()}
              </p>
            )}
            {baptismalDetails?.godMothers &&
              baptismalDetails.godMothers.length > 0 && (
                <p className="w-max">
                  <strong>God Mothers:</strong>{" "}
                  {baptismalDetails.godMothers
                    .map(
                      // @ts-ignore
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
                      // @ts-ignore
                      (godFather) =>
                        `${godFather.firstName} ${godFather.lastName}`
                    )
                    .join(", ")}
                </p>
              )}
            {(appointment.priestId ||
              appointment.altarServerId ||
              appointment.altarServerPresidentId) &&
              ministersSection}
            <div className="mt-4">
              <Link target="_blank" href={getCertificateLink(appointment)}>
                <Button variant="outline">View Certificate</Button>
              </Link>
            </div>
          </div>
        );

      case "wedding":
        const weddingDetails = appointment?.wedding;
        return (
          <div className="flex flex-col">
            {parishionerSection}
            <div className="flex gap-x-10">
              <div>
                <h3 className="text-lg font-bold">Bride Details</h3>
                <Separator className="my-2" />
                <div className="mt-4">
                  <p className="w-max">
                    <strong>Name:</strong>{" "}
                    {`${weddingDetails.bride.name?.firstName} ${weddingDetails.bride.name?.lastName}`}
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
                    <strong>Occupation:</strong>{" "}
                    {weddingDetails.bride.occupation}
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
                <Separator className="my-2" />
                <div className="mt-4">
                  <p className="w-max">
                    <strong>Name:</strong>{" "}
                    {`${weddingDetails.groom.name?.firstName} ${weddingDetails.groom.name?.lastName}`}
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
                    <strong>Occupation:</strong>{" "}
                    {weddingDetails.groom.occupation}
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
            {(appointment.priestId ||
              appointment.altarServerId ||
              appointment.altarServerPresidentId) &&
              ministersSection}
            <div className="mt-4">
              <Link target="_blank" href={getCertificateLink(appointment)}>
                <Button variant="outline">View Certificate</Button>
              </Link>
            </div>
          </div>
        );

      case "confirmation":
        const confirmationDetails = appointment?.confirmation.confirmant;
        return (
          <div>
            {parishionerSection}
            {confirmationDetails && (
              <>
                <h3 className="text-xl font-bold">Event Details</h3>
                <Separator className="my-2" />
                <div>
                  <p>
                    <strong>Name:</strong>{" "}
                    {`${confirmationDetails.name?.firstName} ${confirmationDetails.name?.lastName}`}
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
                {(appointment.priestId ||
                  appointment.altarServerId ||
                  appointment.altarServerPresidentId) &&
                  ministersSection}
                <div className="mt-4">
                  <Link target="_blank" href={getCertificateLink(appointment)}>
                    <Button variant="outline">View Certificate</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        );

      case "burial":
        const burialDetails = appointment?.burial.deceased;
        return (
          <div className="flex flex-col">
            {parishionerSection}
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
                  {`${burialDetails.name?.firstName} ${burialDetails.name?.lastName}`}
                </p>
              )}
              {burialDetails?.representativeContactNumber && (
                <p className="w-max">
                  <strong>Representative Contact Number:</strong>{" "}
                  {burialDetails.representativeContactNumber}
                </p>
              )}
              {(appointment.priestId ||
                appointment.altarServerId ||
                appointment.altarServerPresidentId) &&
                ministersSection}
              <div className="mt-4">
                <Link target="_blank" href={getCertificateLink(appointment)}>
                  <Button variant="outline">View Certificate</Button>
                </Link>
              </div>
            </div>
          </div>
        );

      case "houseBlessing":
        const houseBlessingDetails = appointment?.houseBlessing.appointee;
        return (
          <div className="flex flex-col">
            {parishionerSection}
            <div>
              {houseBlessingDetails && (
                <div>
                  <h3 className="text-xl font-bold">Event Details</h3>
                  <Separator className="my-2" />
                  <p>
                    <strong>Name:</strong>{" "}
                    {`${houseBlessingDetails.name?.firstName} ${houseBlessingDetails.name?.lastName}`}
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
              {(appointment.priestId ||
                appointment.altarServerId ||
                appointment.altarServerPresidentId) &&
                ministersSection}
              <div className="mt-4">
                <Link target="_blank" href={getCertificateLink(appointment)}>
                  <Button variant="outline">View Certificate</Button>
                </Link>
              </div>
            </div>
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
  // @ts-ignore
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
                  // @ts-ignore
                  key={appointment.id}
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <div className="flex items-center gap-x-2">
                        <h2 className="font-bold text-xl">
                          {/* @ts-ignore */}
                          {formatAppointmentType(appointment?.appointmentType)}
                        </h2>
                        <p className="w-max h-max flex items-center text-[10px] gap-x-2 p-1 px-2 rounded-md bg-gray-200">
                          <User size={10} color="gray" />
                          {/* @ts-ignore */}
                          {users.find((user) => user.id === appointment.userId)
                            ? `${
                                // @ts-ignore
                                users.find(
                                  // @ts-ignore
                                  (user) => user.id === appointment.userId
                                ).firstName
                              } ${
                                // @ts-ignore
                                users.find(
                                  // @ts-ignore
                                  (user) => user.id === appointment.userId
                                ).lastName
                              }`
                            : "User not found"}
                        </p>
                      </div>
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
                      {/* @ts-ignore */}
                      {appointment.status !== "Confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleEditParticipants(appointment)}
                          className="ml-2"
                        >
                          {getParticipantName("priest") !== `Select Priest` ||
                          getParticipantName("altarServer") !==
                            `Select AltarServer` ||
                          getParticipantName("altarServerPresident") !==
                            `Select AltarServerPresident` ? (
                            <UserPen />
                          ) : (
                            <UserPen />
                          )}{" "}
                          {getParticipantName("priest") !== `Select Priest` ||
                          getParticipantName("altarServer") !==
                            `Select AltarServer` ||
                          getParticipantName("altarServerPresident") !==
                            `Select AltarServerPresident`
                            ? "Edit Participants"
                            : "Add Participants"}
                        </Button>
                      )}
                      {/* @ts-ignore */}
                      {appointment.status !== "Confirmed" && (
                        <Button
                          variant="outline"
                          onClick={() => handleConfirmAppointment(appointment)}
                          className="ml-2"
                          disabled={
                            // @ts-ignore
                            !appointment.altarServerId &&
                            // @ts-ignore
                            !appointment.altarServerPresidentId &&
                            // @ts-ignore
                            !appointment.priestId
                          }
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
                            .filter(
                              (user) =>
                                // @ts-ignore
                                user.role === "priest" &&
                                // @ts-ignore
                                user.available === true
                            )
                            .map((user) => (
                              <DropdownMenuItem
                                // @ts-ignore
                                key={user.id}
                                onSelect={() =>
                                  // @ts-ignore
                                  handleSelectParticipant("priest", user.id)
                                }
                              >
                                {/* @ts-ignore */}
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
                            .filter(
                              (user) =>
                                // @ts-ignore
                                user.role === "altarServer" &&
                                // @ts-ignore
                                user.available === true
                            )
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
                                {/* @ts-ignore */}
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
                            // @ts-ignore
                            .filter(
                              (user) =>
                                // @ts-ignore
                                user.role === "altarServerPresident" &&
                                // @ts-ignore
                                user.available === true
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
                                {/* @ts-ignore */}
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
                  // @ts-ignore
                  key={appointment.id}
                  className="mb-4 w-full border border-gray-300/50 shadow-lg shadow-gray-300/20 rounded-md p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <div className="flex items-center gap-x-2">
                        <h2 className="font-bold text-xl">
                          {/* @ts-ignore */}
                          {formatAppointmentType(appointment?.appointmentType)}
                        </h2>
                        <p className="w-max h-max flex items-center text-[10px] gap-x-2 p-1 px-2 rounded-md bg-gray-200">
                          <User size={10} color="gray" />
                          {/* @ts-ignore */}
                          {users.find((user) => user.id === appointment.userId)
                            ? `${
                                // @ts-ignore
                                users.find(
                                  // @ts-ignore
                                  (user) => user.id === appointment.userId
                                ).firstName
                              } ${
                                // @ts-ignore
                                users.find(
                                  // @ts-ignore
                                  (user) => user.id === appointment.userId
                                ).lastName
                              }`
                            : "User not found"}
                        </p>
                      </div>
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
                      <Link
                        target="_blank"
                        href={getCertificateLink(appointment)}
                      >
                        <Button variant="outline">View Certificate</Button>
                      </Link>
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

      <Dialog
        open={!!confirmationAppointment}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationAppointment(null);
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
              onClick={() => setConfirmationAppointment(null)}
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
