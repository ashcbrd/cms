"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerificationPage() {
  const [driveLink, setDriveLink] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!driveLink || !userId) {
      setErrorMessage("Drive link and user ID are required.");
      return;
    }

    try {
      const verificationRef = doc(collection(db, "verifications"));
      await setDoc(verificationRef, {
        id: verificationRef.id,
        driveLink,
        userId,
        verificationStatus: "pending",
      });

      setDriveLink("");
      setErrorMessage(null);
      setSuccessMessage("Verification link submitted successfully!");
    } catch (error) {
      console.error("Error saving verification data:", error);
      setErrorMessage("Error saving data to the database.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center py-20 max-w-[8xl] mx-auto w-[600px]">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="w-max mr-auto"
      >
        <ArrowLeftFromLine /> Back
      </Button>
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <label className="mb-2">
          Please provide the Google Drive link to the image of your ID.
        </label>
        <Input
          type="text"
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          placeholder="Enter your Google Drive link"
          required
        />
        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </div>
  );
}
