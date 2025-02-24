"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "@/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import AppointmentCard from "@/components/appointment-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format-date";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { Separator } from "@/components/ui/separator";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        const appointmentsRef = collection(db, "appointments");
        const appointmentsSnap = await getDocs(appointmentsRef);

        const appointmentsData = appointmentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userId = auth.currentUser ? auth.currentUser.uid : null;
        if (userId) {
          const filteredAppointments = appointmentsData.filter(
            // @ts-ignore
            (appointment) => appointment.userId === userId
          );
          // @ts-ignore
          setAppointments(filteredAppointments);
          const usersRef = collection(db, "users");
          const usersSnap = await getDocs(usersRef);
          const usersData = usersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // @ts-ignore
          setUsers(usersData);
        } else {
          setError(
            "User not authenticated. Please log in to view appointments."
          );
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // @ts-ignore
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (!userId) {
      setError("User not authenticated. Please log in to set an appointment.");
      return;
    }

    if (selectedAppointment) {
      try {
        const feedbackRef = doc(collection(db, "feedbacks"));
        await setDoc(feedbackRef, {
          id: feedbackRef.id,
          userId,
          // @ts-ignore
          appointmentId: selectedAppointment.id,
          feedback: feedbackText,
        });
        setFeedbackText("");
        setIsFeedbackVisible(false);
        setSelectedAppointment(null);
        setFeedbackError(null);
      } catch (err) {
        setFeedbackError("Failed to submit feedback.");
      }
    }
  };

  // @ts-ignore
  const renderDetails = (appointment) => {
    const ministersSection = (
      <div className="mt-6">
        <h3 className="text-xl font-bold">Ministers</h3>
        <Separator className="my-2" />
        <div className="flex flex-col">
          {appointment.priestId && (
            <p>
              <strong>Priest:</strong> {/*  @ts-ignore */}
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
            <div>
              {burialDetails?.dateOfBirth && (
                <p className="w-max">
                  <strong>Date of Birth:</strong>{" "}
                  {formatDate(
                    new Date(burialDetails.dateOfBirth).toLocaleString()
                  )}
                </p>
              )}
              {burialDetails?.dateOfDeath && (
                <p className="w-max">
                  <strong>Date of Death:</strong>{" "}
                  {formatDate(
                    new Date(burialDetails.dateOfDeath).toLocaleString()
                  )}
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
        {appointments.map((appointment) => {
          // @ts-ignore
          const appointmentDate = new Date(appointment.date);
          const today = new Date();
          const canLeaveFeedback =
            // @ts-ignore
            appointment.status === "Confirmed" && appointmentDate < today;

          return (
            <Dialog
              key={
                // @ts-ignore
                appointment.id
              }
            >
              <DialogTrigger className="w-full">
                <AppointmentCard appointment={appointment} />
              </DialogTrigger>
              <DialogContent className="!min-w-max p-10">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {
                      // @ts-ignore
                      formatAppointmentType(appointment.appointmentType)
                        .charAt(0)
                        .toUpperCase() +
                        // @ts-ignore
                        formatAppointmentType(
                          // @ts-ignore
                          appointment.appointmentType
                        ).slice(1)
                    }{" "}
                    Appointment
                  </DialogTitle>
                </DialogHeader>
                {renderDetails(appointment)}
                {canLeaveFeedback && (
                  <div className="mt-5">
                    <Button
                      variant="secondary"
                      onClick={() => setIsFeedbackVisible(!isFeedbackVisible)}
                    >
                      Leave Feedback
                    </Button>
                    {isFeedbackVisible && (
                      <form
                        onSubmit={handleFeedbackSubmit}
                        className="flex flex-col mt-4"
                      >
                        {feedbackError && (
                          <p className="text-red-600">{feedbackError}</p>
                        )}
                        <Textarea
                          placeholder="Enter your feedback here"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          required
                        />
                        <div className="flex justify-end mt-4">
                          <Button type="submit">Submit Feedback</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsFeedbackVisible(false);
                              setFeedbackText("");
                              setFeedbackError(null);
                            }}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentsPage;
