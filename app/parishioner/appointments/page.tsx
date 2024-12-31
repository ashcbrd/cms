"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import AppointmentCard from "@/components/appointment-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format-date";
import { Separator } from "@/components/ui/separator";
import { formatAppointmentType } from "@/lib/format-appointment-type";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointmentCollection = collection(db, "appointments");
        const snapshot = await getDocs(appointmentCollection);
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
      <div className="mt-10 flex flex-col">
        {appointments.map((appointment) => (
          <Dialog key={appointment.id}>
            <DialogTrigger className="w-full">
              <AppointmentCard key={appointment.id} appointment={appointment} />
            </DialogTrigger>
            <DialogContent className="!min-w-max p-10">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {formatAppointmentType(appointment.appointmentType)
                    .charAt(0)
                    .toUpperCase() +
                    formatAppointmentType(appointment.appointmentType).slice(
                      1
                    )}{" "}
                  Appointment
                </DialogTitle>
              </DialogHeader>
              {renderDetails(appointment)}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;
