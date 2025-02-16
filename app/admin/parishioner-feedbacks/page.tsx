"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<
    {
      id: string;
      appointmentId: string;
      feedback: string;
      userId: string;
    }[]
  >([]);
  const [users, setUsers] = useState<{
    [key: string]: { firstName: string; lastName: string };
  }>({});
  const [appointments, setAppointments] = useState<{
    [key: string]: { appointmentType: string; date: string };
  }>({});
  const [selectedFeedback, setSelectedFeedback] = useState<null | string>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbacksRef = collection(db, "feedbacks");
        const querySnapshot = await getDocs(feedbacksRef);

        const feedbacksList = querySnapshot.docs.map(
          (doc) =>
            ({ id: doc.id, ...doc.data() } as {
              id: string;
              appointmentId: string;
              feedback: string;
              userId: string;
            })
        );
        setFeedbacks(feedbacksList);

        const userIds = feedbacksList.map((feedback) => feedback.userId);
        const appointmentIds = feedbacksList.map(
          (feedback) => feedback.appointmentId
        );

        const userPromises = userIds.map(async (userId) => {
          const userSnapshot = await getDocs(collection(db, "users"));
          const user = userSnapshot.docs.find((doc) => doc.id === userId);
          return user ? { id: userId, ...user.data() } : null;
        });

        const appointmentPromises = appointmentIds.map(
          async (appointmentId) => {
            const appointmentRef = doc(db, "appointments", appointmentId);
            const appointmentSnapshot = await getDoc(appointmentRef);
            return appointmentSnapshot.exists()
              ? { id: appointmentId, ...appointmentSnapshot.data() }
              : null;
          }
        );

        const userDetails = await Promise.all(userPromises);
        const appointmentDetails = await Promise.all(appointmentPromises);

        const usersMap: {
          [key: string]: { firstName: string; lastName: string };
        } = {};
        userDetails.forEach((user) => {
          if (user) {
            usersMap[user.id] = {
              // @ts-ignore
              firstName: user.firstName,
              // @ts-ignore
              lastName: user.lastName,
            };
          }
        });

        const appointmentsMap: {
          [key: string]: { appointmentType: string; date: string };
        } = {};
        appointmentDetails.forEach((appointment) => {
          if (appointment) {
            appointmentsMap[appointment.id] = {
              // @ts-ignore
              appointmentType: appointment.appointmentType,
              // @ts-ignore
              date: new Date(appointment.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            };
          }
        });

        setUsers(usersMap);
        setAppointments(appointmentsMap);
      } catch (error) {
        console.error(
          "Error fetching feedbacks or users or appointments: ",
          error
        );
      }
    };

    fetchFeedbacks();
  }, []);

  const handleFeedbackClick = (feedback: string) => {
    setSelectedFeedback(feedback);
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-4">View Feedbacks</h1>
      {feedbacks.length === 0 ? (
        <div className="text-center">
          <p>No feedbacks found</p>
        </div>
      ) : (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="border-b">User Name</th>
              <th className="border-b">Appointment Type</th>
              <th className="border-b">Appointment Date</th>
              <th className="border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => {
              const user = users[feedback.userId];
              const appointment = appointments[feedback.appointmentId];
              return (
                <tr key={feedback.id}>
                  <td className="border-b text-center py-4">
                    {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                  </td>
                  <td className="border-b text-center py-4">
                    {appointment ? appointment.appointmentType : "Loading..."}
                  </td>
                  <td className="border-b text-center py-4">
                    {appointment ? appointment.date : "Loading..."}
                  </td>
                  <td className="border-b text-center py-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={"secondary"}
                          onClick={() => handleFeedbackClick(feedback.feedback)}
                        >
                          View Feedback
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Feedback Details</DialogTitle>
                        </DialogHeader>
                        <p>{selectedFeedback}</p>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
