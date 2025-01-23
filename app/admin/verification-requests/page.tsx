"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function VerificationRequestsPage() {
  const [verificationRequests, setVerificationRequests] = useState<
    {
      id: string;
      driveLink: string;
      userId: string;
      verificationStatus: string;
    }[]
  >([]);
  const [users, setUsers] = useState<{
    [key: string]: { firstName: string; lastName: string };
  }>({});

  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [isAcceptAction, setIsAcceptAction] = useState(false);

  useEffect(() => {
    const fetchVerificationRequests = async () => {
      try {
        const verificationRef = collection(db, "verifications");
        const querySnapshot = await getDocs(
          query(verificationRef, where("verificationStatus", "==", "Pending"))
        );

        const verifications = querySnapshot.docs.map(
          (doc) =>
            ({ id: doc.id, ...doc.data() } as {
              id: string;
              driveLink: string;
              userId: string;
              verificationStatus: string;
            })
        );
        setVerificationRequests(verifications);

        const userIds = verifications.map(
          (verification) => verification.userId
        );
        const userPromises = userIds.map(async (userId) => {
          const userSnapshot = await getDocs(collection(db, "users"));
          const user = userSnapshot.docs.find((doc) => doc.id === userId);
          return user ? { id: userId, ...user.data() } : null;
        });

        const userDetails = await Promise.all(userPromises);
        const usersMap: {
          [key: string]: { firstName: string; lastName: string };
        } = {};
        userDetails.forEach((user) => {
          if (user) {
            usersMap[user.id] = {
              firstName: user.firstName,
              lastName: user.lastName,
            };
          }
        });

        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching verification requests or users: ", error);
      }
    };

    fetchVerificationRequests();
  }, []);

  const updateUserVerificationStatus = async (
    userId: string,
    status: string
  ) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { verificationStatus: status });
  };

  const refetchVerificationRequests = async () => {
    const verificationRef = collection(db, "verifications");
    const querySnapshot = await getDocs(
      query(verificationRef, where("verificationStatus", "==", "Pending"))
    );

    const verifications = querySnapshot.docs.map(
      (doc) =>
        ({ id: doc.id, ...doc.data() } as {
          id: string;
          driveLink: string;
          userId: string;
          verificationStatus: string;
        })
    );
    setVerificationRequests(verifications);
  };

  const handleAccept = async () => {
    if (currentRequestId) {
      try {
        const verificationRef = doc(db, "verifications", currentRequestId);
        await updateDoc(verificationRef, { verificationStatus: "Verified" });

        const request = verificationRequests.find(
          (req) => req.id === currentRequestId
        );
        if (request) {
          await updateUserVerificationStatus(request.userId, "Verified");
        }

        await refetchVerificationRequests();
      } catch (error) {
        console.error("Error updating verification status: ", error);
      } finally {
        setOpenDialog(false);
        setCurrentRequestId(null);
      }
    }
  };

  const handleDeny = async () => {
    if (currentRequestId) {
      try {
        const verificationRef = doc(db, "verifications", currentRequestId);
        await updateDoc(verificationRef, { verificationStatus: "Unverified" });

        // Update user verification status
        const request = verificationRequests.find(
          (req) => req.id === currentRequestId
        );
        if (request) {
          await updateUserVerificationStatus(request.userId, "Unverified");
        }

        await refetchVerificationRequests(); // Refresh the verification requests
      } catch (error) {
        console.error("Error updating verification status: ", error);
      } finally {
        setOpenDialog(false);
        setCurrentRequestId(null);
      }
    }
  };

  const openAcceptDialog = (id: string) => {
    setCurrentRequestId(id);
    setIsAcceptAction(true);
    setOpenDialog(true);
  };

  const openDenyDialog = (id: string) => {
    setCurrentRequestId(id);
    setIsAcceptAction(false);
    setOpenDialog(true);
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl font-bold mb-4">Manage Verification Requests</h1>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="border-b">Parishioner Name</th>
            <th className="border-b">Link for ID Image</th>
            <th className="border-b">Verification Status</th>
            <th className="border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {verificationRequests.length === 0 ? (
            <tr>
              <td colSpan={4} className="border-b text-center">
                No verification requests
              </td>
            </tr>
          ) : (
            verificationRequests.map((request) => {
              const user = users[request.userId];
              return (
                <tr key={request.id}>
                  <td className="border-b text-center py-4">
                    {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                  </td>
                  <td className="border-b text-center py-4">
                    <Button variant="secondary">
                      <a target="_blank" href={request.driveLink}>
                        Open Link
                      </a>
                    </Button>
                  </td>
                  <td className="border-b text-center py-4">
                    {request.verificationStatus}
                  </td>
                  <td className="border-b text-center py-4">
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <div className="flex gap-x-4 w-max mx-auto">
                        <DialogTrigger>
                          <Button
                            variant="secondary"
                            onClick={() => openAcceptDialog(request.id)}
                          >
                            Accept Verification
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                          <Button
                            variant="outline"
                            onClick={() => openDenyDialog(request.id)}
                          >
                            Deny Verification
                          </Button>
                        </DialogTrigger>
                      </div>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {isAcceptAction
                              ? "Confirm Acceptance"
                              : "Confirm Denial"}
                          </DialogTitle>
                        </DialogHeader>
                        <p>
                          Are you sure you want to{" "}
                          {isAcceptAction ? "accept" : "deny"} this verification
                          request?
                        </p>
                        <div className="flex justify-end mt-4">
                          {isAcceptAction ? (
                            <button
                              onClick={handleAccept}
                              className="bg-green-500 text-white py-1 px-2 rounded mr-2"
                            >
                              Confirm Acceptance
                            </button>
                          ) : (
                            <button
                              onClick={handleDeny}
                              className="bg-red-500 text-white py-1 px-2 rounded mr-2"
                            >
                              Confirm Denial
                            </button>
                          )}
                          <button
                            onClick={() => setOpenDialog(false)}
                            className="bg-gray-300 text-black py-1 px-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
