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

const DashboardPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

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
      if (status === "Accepted") {
        toast({
          duration: 5000,
          title: "Appointment accepted.",
        });
      } else if (status === "Denied") {
        toast({
          title: "Appointment denied.",
        });
      }
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
  }, {} as Record<string, any[]>);

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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
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
                  <li key={app.id} className="border-b border-gray-200 py-2">
                    <Dialog>
                      <div className="flex items-center justify-between">
                        <DialogTrigger>
                          <h2 className="hover:underline transition-all">
                            <span className="font-bold">
                              {formatAppointmentType(app.appointmentType)}
                            </span>{" "}
                            -{" "}
                            {formatDate(
                              new Date(app.date).toLocaleDateString()
                            )}
                          </h2>
                        </DialogTrigger>
                        <div className="mt-2">
                          <Button
                            onClick={() =>
                              updateAppointmentStatus(app.id, "Accepted")
                            }
                            className="mr-2  py-1 px-3 bg-blue-500 hover:bg-blue-700"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
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
                            {formatAppointmentType(app.appointmentType)
                              .charAt(0)
                              .toUpperCase() +
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
                              updateAppointmentStatus(app.id, "Accepted")
                            }
                            className="mr-2  py-1 px-3"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
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
              <div
                key={status}
                className="bg-white p-4 border border-gray-300/50 rounded-lg shadow-md shadow-gray-300/20 mt-4"
              >
                <h2 className="text-xl font-semibold">{status} Appointments</h2>
                {groupedAppointments[status].length > 0 && (
                  <p className="text-gray-600 font-normal text-xs">
                    Click an appointment to see details.
                  </p>
                )}
                {groupedAppointments[status].length > 0 ? (
                  <ul className="max-h-52 overflow-y-auto">
                    {groupedAppointments[status].map((app) => (
                      <li
                        key={app.id}
                        className="border-b border-gray-200 py-2"
                      >
                        <Dialog>
                          <DialogTrigger>
                            <h2 className="hover:underline transition-all">
                              <span className="font-bold">
                                {formatAppointmentType(app.appointmentType)}
                              </span>{" "}
                              -{" "}
                              {formatDate(
                                new Date(app.date).toLocaleDateString()
                              )}
                            </h2>
                          </DialogTrigger>
                          <DialogContent className="!min-w-max p-10">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                {formatAppointmentType(app.appointmentType)
                                  .charAt(0)
                                  .toUpperCase() +
                                  formatAppointmentType(
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
};

export default DashboardPage;
