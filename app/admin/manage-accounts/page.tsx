"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, UserPen, Trash } from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRole } from "@/lib/format-role";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const ManageAccounts: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<{
    admin?: boolean;
    altarServer?: boolean;
    priest?: boolean;
    altarServerPresident?: boolean;
    parishioner?: boolean;
  }>({
    admin: false,
    altarServer: false,
    priest: false,
    altarServerPresident: false,
    parishioner: false,
  });
  const [newUser, setNewUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    contactNumber: string;
    role: string;
    password: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNumber: "",
    role: "",
    password: "",
  });

  const [editUser, setEditUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [passwordValidation, setPasswordValidation] = useState<any>({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });

  const fetchUsers = async () => {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersList);
    setFilteredUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        (selectedRoles.parishioner && user.role === "parishioner") ||
        (selectedRoles.admin && user.role === "admin") ||
        (selectedRoles.altarServer && user.role === "altarServer") ||
        (selectedRoles.priest && user.role === "priest") ||
        (selectedRoles.altarServerPresident &&
          user.role === "altarServerPresident");

      return (
        matchesSearch &&
        (Object.values(selectedRoles).some((role) => role) ? matchesRole : true)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRoles, users]);

  const handleRoleChange = (role: string) => {
    //@ts-ignore
    setSelectedRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const openEditDialog = (user: any) => {
    setEditUser(user);
    setIsEditDialogOpen(true);
  };

  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 6,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    };
    setPasswordValidation(validations);
  };

  const handleCreateUser = async () => {
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.role ||
      !newUser.address ||
      !newUser.contactNumber ||
      !newUser.password ||
      !passwordValidation.length ||
      !passwordValidation.number ||
      !passwordValidation.uppercase ||
      !passwordValidation.lowercase
    ) {
      console.log("Please fill in all fields correctly.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const user = userCredential.user;

      const userData = {
        email: user.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        contactNumber: newUser.contactNumber,
        role: newUser.role,
      };

      await setDoc(doc(db, "users", user.uid), userData);
      toast({
        title: "Registered successfully",
      });

      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        contactNumber: "",
        role: "",
        password: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleEditUser = async () => {
    if (!editUser?.firstName || !editUser?.lastName || !editUser?.email) return;

    const userRef = doc(db, "users", editUser.id);
    await updateDoc(userRef, editUser);
    fetchUsers();
    setIsEditDialogOpen(false);
    setEditUser(null);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      const userRef = doc(db, "users", userToDelete.id);
      await deleteDoc(userRef);
      fetchUsers();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const highlightText = (text: string) => {
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="font-semibold bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Accounts</h1>
      <div className="flex items-center gap-x-4 mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="border rounded p-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild onClick={() => setIsEditDialogOpen(true)}>
            <Button className="flex items-center">
              <UserPlus /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateUser();
                setIsEditDialogOpen(false);
              }}
              className="w-full flex flex-col"
            >
              <Input
                type="text"
                id="firstName"
                placeholder="First Name"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
              <Input
                type="text"
                id="lastName"
                placeholder="Last Name"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
              <Input
                type="email"
                id="email"
                placeholder="Email"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <Input
                type="text"
                id="address"
                placeholder="Address"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.address}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, address: e.target.value }))
                }
              />
              <Input
                type="text"
                id="contactNumber"
                placeholder="Contact Number"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.contactNumber}
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    contactNumber: e.target.value,
                  }))
                }
              />
              <Input
                type="password"
                id="password"
                placeholder="Password"
                className="border rounded p-2 mb-4 w-full"
                value={newUser.password}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, password: e.target.value }));
                  validatePassword(e.target.value);
                }}
              />
              <div className="mb-6">
                <label className="block mb-1" htmlFor="role">
                  Role
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="border text-start pl-4 py-1 rounded-md w-full">
                    {formatRole(newUser.role) || "Select Role"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setNewUser((prev) => ({ ...prev, role: "admin" }))
                      }
                    >
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewUser((prev) => ({ ...prev, role: "priest" }))
                      }
                    >
                      Priest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewUser((prev) => ({
                          ...prev,
                          role: "altarServerPresident",
                        }))
                      }
                    >
                      Altar Server President
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setNewUser((prev) => ({ ...prev, role: "altarServer" }))
                      }
                    >
                      Altar Server
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button type="submit" className="ml-auto">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex gap-x-4 items-center">
        <label className="mr-2 flex items-center gap-x-2">
          <Checkbox
            checked={selectedRoles.admin}
            onCheckedChange={() => handleRoleChange("admin")}
          />
          Admin
        </label>
        <label className="mr-2 flex items-center gap-x-2">
          <Checkbox
            checked={selectedRoles.parishioner}
            onCheckedChange={() => handleRoleChange("parishioner")}
          />
          Parishioner
        </label>
        <label className="mr-2 flex items-center gap-x-2">
          <Checkbox
            checked={selectedRoles.altarServer}
            onCheckedChange={() => handleRoleChange("altarServer")}
          />
          Altar Server
        </label>
        <label className="mr-2 flex items-center gap-x-2">
          <Checkbox
            checked={selectedRoles.priest}
            onCheckedChange={() => handleRoleChange("priest")}
          />
          Priest
        </label>
        <label className="mr-2 flex items-center gap-x-2">
          <Checkbox
            checked={selectedRoles.altarServerPresident}
            onCheckedChange={() => handleRoleChange("altarServerPresident")}
          />
          Altar Server President
        </label>
      </div>

      <h2 className="text-2xl font-semibold mt-6">List of Users:</h2>
      <ul className="mt-4">
        {filteredUsers.map((user) => {
          if (auth.currentUser) {
            if (user.id === auth.currentUser.uid) {
              return null;
            }
          }
          return (
            <li
              key={user.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                {highlightText(
                  `${user.firstName} ${user.lastName} (${user.email})`
                )}{" "}
                -{" "}
                <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                  {highlightText(`${formatRole(user.role)}`)}
                </span>
              </div>
              <div className="flex items-center gap-x-2">
                {user.role !== "parishioner" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(user)}
                    >
                      <UserPen />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUserToDelete(user);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash />
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div>
            <p>Are you sure you want to delete this user?</p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAccounts;
