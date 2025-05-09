"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./custom-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { formatDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const [users, setUsers] = useState([]);
  const [expandedStatuses, setExpandedStatuses] = useState<
    Record<string, boolean>
  >({
    Accepted: false,
    Denied: false,
    Confirmed: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAppointments();
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
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // @ts-ignore
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching appointments: ", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const appointmentRef = doc(db, "appointments", id);

    try {
      await updateDoc(appointmentRef, {
        status: status,
      });

      const appointment = appointments.find((app) => app.id === id);
      // @ts-ignore
      const user = users.find((user) => user.id === appointment?.userId);

      // @ts-ignore
      if (user && user.contactNumber) {
        const message =
          status === "Accepted"
            ? `Your appointment for ${formatAppointmentType(
                appointment!.appointmentType
              )} on ${formatDate(
                new Date(appointment!.date).toLocaleDateString()
              )} has been accepted.`
            : `Your appointment for ${formatAppointmentType(
                appointment!.appointmentType
              )} on ${formatDate(
                new Date(appointment!.date).toLocaleDateString()
              )} has been denied.`;

        // Send SMS using the sendSms function inside useEffect
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

        // @ts-ignore
        await sendSms(user.contactNumber, message);
      }

      toast({
        duration: 5000,
        title: `Appointment ${status.toLowerCase()}.`,
      });

      fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment status: ", err);
    }
  };

  useEffect(() => {
    const datesWithAppointments = appointments.map((app) => new Date(app.date));
    setHighlightedDates(datesWithAppointments);
  }, [appointments]);

  const statuses = ["Pending", "Accepted", "Denied", "Confirmed"];

  const groupedAppointments = statuses.reduce((acc, status) => {
    acc[status] = appointments.filter((app) => app.status === status);
    return acc;
  }, {} as Record<string, unknown[]>);

  const toggleExpand = (status: string) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  //@ts-ignore
  const renderDetails = (appointment) => {
    const ministersSection = (
      <div className="mt-6">
        <h3 className="text-xl font-bold">Ministers</h3>
        <Separator className="my-2" />
        <div className="flex flex-col">
          {appointment.priestId && (
            <p>
              <strong>Priest:</strong>
              {/* @ts-ignore */}
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
              <strong>Altar Server President:</strong> {/* @ts-ignore */}
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
            <div className="mb-6">
              <h3 className="text-xl font-bold">Appointment Setter</h3>
              <Separator className="my-2" />
              <div>
                {appointment.userId && (
                  <p>
                    <strong>Name:</strong> {/*  @ts-ignore */}
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
                      : "Priest not found"}
                  </p>
                )}
              </div>
            </div>
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
          </div>
        );

      case "wedding":
        const weddingDetails = appointment?.wedding;
        return (
          <div className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Appointment Setter</h3>
              <Separator className="my-2" />
              <div>
                {appointment.userId && (
                  <p>
                    <strong>Name:</strong> {/*  @ts-ignore */}
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
                      : "Priest not found"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-x-10">
              <div>
                <h3 className="text-lg font-bold">Bride Details</h3>
                <Separator className="my-2" />
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
          </div>
        );

      case "confirmation":
        const confirmationDetails = appointment?.confirmation.confirmant;
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Appointment Setter</h3>
              <Separator className="my-2" />
              <div>
                {appointment.userId && (
                  <p>
                    <strong>Name:</strong> {/*  @ts-ignore */}
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
                      : "Priest not found"}
                  </p>
                )}
              </div>
            </div>
            {confirmationDetails && (
              <>
                <h3 className="text-xl font-bold">Event Details</h3>
                <Separator className="my-2" />
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
                {(appointment.priestId ||
                  appointment.altarServerId ||
                  appointment.altarServerPresidentId) &&
                  ministersSection}
              </>
            )}
          </div>
        );

      case "burial":
        const burialDetails = appointment?.burial.deceased;
        return (
          <div className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Appointment Setter</h3>
              <Separator className="my-2" />
              <div>
                {appointment.userId && (
                  <p>
                    <strong>Name:</strong> {/*  @ts-ignore */}
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
                      : "Priest not found"}
                  </p>
                )}
              </div>
            </div>
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
              {(appointment.priestId ||
                appointment.altarServerId ||
                appointment.altarServerPresidentId) &&
                ministersSection}
            </div>
          </div>
        );

      case "houseBlessing":
        const houseBlessingDetails = appointment?.houseBlessing.appointee;
        return (
          <div className="flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Appointment Setter</h3>
              <Separator className="my-2" />
              <div>
                {appointment.userId && (
                  <p>
                    <strong>Name:</strong> {/*  @ts-ignore */}
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
                      : "Priest not found"}
                  </p>
                )}
              </div>
            </div>
            <div>
              {houseBlessingDetails && (
                <div>
                  <h3 className="text-xl font-bold">Event Details</h3>
                  <Separator className="my-2" />
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
              {(appointment.priestId ||
                appointment.altarServerId ||
                appointment.altarServerPresidentId) &&
                ministersSection}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Manage Appointments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="bg-white p-4 border border-gray-300/50 rounded-lg shadow-md shadow-gray-300/20 mt-4">
            <h2 className="text-xl font-semibold">Pending Appointments </h2>
            <p className="text-gray-600 font-normal text-xs">
              Click an appointment to see details.
            </p>
            {groupedAppointments["Pending"].length > 0 ? (
              <ul className="max-h-52 overflow-y-auto">
                {groupedAppointments["Pending"].map((app) => (
                  //@ts-ignore
                  <li key={app.id} className="border-b border-gray-200 py-2">
                    <Dialog>
                      <div className="flex items-center justify-between">
                        <DialogTrigger>
                          <h2 className="hover:underline transition-all">
                            <span className="font-bold">
                              {/*  @ts-ignore */}
                              {formatAppointmentType(app.appointmentType)}
                            </span>{" "}
                            -{" "}
                            {formatDate(
                              //@ts-ignore
                              new Date(app.date).toLocaleDateString()
                            )}
                          </h2>
                        </DialogTrigger>
                        <div className="mt-2">
                          <Button
                            onClick={() =>
                              //@ts-ignore
                              updateAppointmentStatus(app.id, "Accepted")
                            }
                            className="mr-2  py-1 px-3 bg-blue-500 hover:bg-blue-700"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              //@ts-ignore
                              updateAppointmentStatus(app.id, "Denied")
                            }
                            className="py-1 px-3"
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                      <DialogContent className="!min-w-max p-10">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            {/* @ts-ignore */}
                            {formatAppointmentType(app.appointmentType)
                              .charAt(0)
                              .toUpperCase() +
                              //@ts-ignore
                              formatAppointmentType(app.appointmentType).slice(
                                1
                              )}{" "}
                            Appointment
                          </DialogTitle>
                        </DialogHeader>
                        {renderDetails(app)}
                        <div className="mt-2">
                          <Button
                            onClick={() =>
                              //@ts-ignore
                              updateAppointmentStatus(app.id, "Accepted")
                            }
                            className="mr-2  py-1 px-3"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              //@ts-ignore
                              updateAppointmentStatus(app.id, "Denied")
                            }
                            className="py-1 px-3"
                          >
                            Deny
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No appointments for this status.</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {statuses.slice(1).map((status) => (
              <div key={status} className="mt-4">
                <div
                  className="flex items-center justify-between cursor-pointer bg-gray-50 py-2 px-4 rounded-lg shadow shadow-gray-200"
                  onClick={() => toggleExpand(status)}
                >
                  <h2 className="text-xl font-semibold">
                    {status} Appointments
                  </h2>
                  {expandedStatuses[status] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                {expandedStatuses[status] && (
                  <>
                    {groupedAppointments[status].length > 0 ? (
                      <ul className="max-h-52 overflow-y-auto px-4">
                        {groupedAppointments[status].map((app) => (
                          <li
                            //@ts-ignore
                            key={app.id}
                            className="border-b border-gray-200 py-2"
                          >
                            <Dialog>
                              <DialogTrigger>
                                <h2 className="hover:underline transition-all">
                                  <span className="font-bold">
                                    {/*  @ts-ignore */}
                                    {formatAppointmentType(app.appointmentType)}
                                  </span>{" "}
                                  -{" "}
                                  {formatDate(
                                    //@ts-ignore
                                    new Date(app.date).toLocaleDateString()
                                  )}
                                </h2>
                              </DialogTrigger>
                              <DialogContent className="!min-w-max p-10">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">
                                    {/*  @ts-ignore */}
                                    {formatAppointmentType(app.appointmentType)
                                      .charAt(0)
                                      .toUpperCase() +
                                      //@ts-ignore
                                      formatAppointmentType(
                                        //@ts-ignore
                                        app.appointmentType
                                      ).slice(1)}{" "}
                                    Appointment
                                  </DialogTitle>
                                </DialogHeader>
                                {renderDetails(app)}
                              </DialogContent>
                            </Dialog>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No appointments for this status.</p>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="col-span-full bg-white mt-6">
              <h2 className="text-xl font-semibold">Appointments Calendar</h2>
              <Calendar
                className="my-calendar mt-6"
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
        </div>
      )}
    </div>
  );
}
