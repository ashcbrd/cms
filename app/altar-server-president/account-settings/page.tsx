"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db, auth } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPen, ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
}

export default function AccountSettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  const user: FirebaseUser | null = auth.currentUser;

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setFormData(data);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, formData as any);
      setUserData(formData);
      setIsModalOpen(false);
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="p-16 flex items-center justify-center w-full h-full">
      <div className="w-[800px]">
        <Button onClick={() => router.back()} variant="ghost">
          <ArrowLeftFromLine /> Back
        </Button>
        <div className="space-y-4 p-10 rounded-xl shadow-xl shadow-gray-300/20 border border-gray-500/20 mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <Button onClick={handleEdit}>
              <UserPen /> Edit
            </Button>
          </div>
          <p>
            <strong>First Name:</strong> {userData.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {userData.lastName}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Contact Number:</strong> {userData.contactNumber}
          </p>
          <p>
            <strong>Address:</strong> {userData.address}
          </p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="border p-2 w-full"
            />
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="border p-2 w-full"
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 w-full"
            />
            <Input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              className="border p-2 w-full"
            />
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border p-2 w-full"
            />
            <Button type="submit" className="ml-auto">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
