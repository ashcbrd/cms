"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { EyeIcon } from "lucide-react";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { formatDate } from "@/lib/format-date";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "./custom-calendar.css";

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const [detailsAppointment, setDetailsAppointment] = useState<any>(null);
  const [value, setValue] = useState<Date>(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAppointments(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async (userId: string) => {
    setLoading(true);
    try {
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("priestId", "==", userId)
      );

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

  useEffect(() => {
    const datesWithAppointments = appointments.map((app) => new Date(app.date));
    setHighlightedDates(datesWithAppointments);
  }, [appointments]);
  // @ts-ignore
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
                    // @ts-ignore
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
                    // @ts-ignore
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Your Appointments</h1>
      {appointments.length === 0 ? (
        <div>No appointments available.</div>
      ) : (
        <ul className="w-full flex flex-col mt-4">
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
                    {formatDate(
                      new Date(appointment.date).toLocaleDateString()
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsAppointment(appointment)}
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
          ))}
        </ul>
      )}
      <h2 className="text-2xl font-semibold my-4">Appointments Calendar</h2>
      <Calendar
        className="my-calendar mt-6"
        tileClassName={({ date }) =>
          highlightedDates.some(
            (highlighted) => highlighted.toDateString() === date.toDateString()
          )
            ? "highlighted"
            : ""
        }
      />
    </div>
  );
};

export default AppointmentsPage;
