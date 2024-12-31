/* eslint-disable react/no-unescaped-entities */
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Trash2, Plus } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAppointmentType } from "@/lib/format-appointment-type";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SetAppoinent = () => {
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  // Baptismal
  const [childDateOfBirth, setChildDateOfBirth] = useState<Date | null>(null);
  const [godMothers, setGodMothers] = useState([
    { firstName: "", lastName: "", contactNumber: "" },
  ]);
  const [godFathers, setGodFathers] = useState([
    { firstName: "", lastName: "", contactNumber: "" },
  ]);

  // Wedding
  const [groomName, setGroomName] = useState({
    firstName: "",
    lastName: "",
  });
  const [brideName, setBrideName] = useState({
    firstName: "",
    lastName: "",
  });
  const [groomDateOfBirth, setGroomDateOfBirth] = useState<Date | null>(null);
  const [brideDateOfBirth, setBrideDateOfBirth] = useState<Date | null>(null);
  const [groomPlaceOfBirth, setGroomPlaceOfBirth] = useState("");
  const [bridePlaceOfBirth, setBridePlaceOfBirth] = useState("");
  const [groomCitizenship, setGroomCitizenship] = useState("");
  const [brideCitizenship, setBrideCitizenship] = useState("");
  const [groomOccupation, setGroomOccupation] = useState("");
  const [brideOccupation, setBrideOccupation] = useState("");
  const [groomReligion, setGroomReligion] = useState("");
  const [brideReligion, setBrideReligion] = useState("");
  const [groomCivilStatus, setGroomCivilStatus] = useState("");
  const [brideCivilStatus, setBrideCivilStatus] = useState("");
  const [groomAddress, setGroomAddress] = useState("");
  const [brideAddress, setBrideAddress] = useState("");
  const [groomFather, setGroomFather] = useState({
    firstName: "",
    lastName: "",
  });
  const [groomMother, setGroomMother] = useState({
    firstName: "",
    lastName: "",
  });
  const [brideFather, setBrideFather] = useState({
    firstName: "",
    lastName: "",
  });
  const [brideMother, setBrideMother] = useState({
    firstName: "",
    lastName: "",
  });

  // Confirmation
  const [confirmantName, setConfirmantName] = useState({
    firstName: "",
    lastName: "",
  });
  const [confirmantContactNumber, setConfirmantContactNumber] = useState("");
  const [confirmantDateOfBirth, setConfirmantDateOfBirth] =
    useState<Date | null>(null);

  // Burial
  const [deceasedName, setDeceasedName] = useState({
    firstName: "",
    lastName: "",
  });
  const [deceasedDateOfBirth, setDeceasedDateOfBirth] = useState<Date | null>(
    null
  );
  const [deceasedDateOfDeath, setDeceasedDateOfDeath] = useState<Date | null>(
    null
  );
  const [representativeContactNumber, setRepresentativeContactNumber] =
    useState("");

  // House Blessing
  const [appointeeName, setAppointeeName] = useState({
    firstName: "",
    lastName: "",
  });
  const [appointeeContactNumber, setAppointeeContactNumber] = useState("");
  const [houseAddress, setHouseAddress] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const router = useRouter();

  const handleCancel = () => {
    const isAnyFieldFilled =
      childDateOfBirth ||
      godMothers.some(
        (mother) =>
          mother.firstName.trim() !== "" ||
          mother.lastName.trim() !== "" ||
          mother.contactNumber.trim() !== ""
      ) ||
      godFathers.some(
        (father) =>
          father.firstName.trim() !== "" ||
          father.lastName.trim() !== "" ||
          father.contactNumber.trim() !== ""
      ) ||
      groomName.firstName.trim() !== "" ||
      groomName.lastName.trim() !== "" ||
      brideName.firstName.trim() !== "" ||
      brideName.lastName.trim() !== "" ||
      groomDateOfBirth ||
      brideDateOfBirth ||
      groomPlaceOfBirth.trim() !== "" ||
      bridePlaceOfBirth.trim() !== "" ||
      groomCitizenship.trim() !== "" ||
      brideCitizenship.trim() !== "" ||
      groomOccupation.trim() !== "" ||
      brideOccupation.trim() !== "" ||
      groomReligion.trim() !== "" ||
      brideReligion.trim() !== "" ||
      groomCivilStatus.trim() !== "" ||
      brideCivilStatus.trim() !== "" ||
      groomAddress.trim() !== "" ||
      brideAddress.trim() !== "" ||
      groomFather.firstName.trim() !== "" ||
      groomFather.lastName.trim() !== "" ||
      groomMother.firstName.trim() !== "" ||
      groomMother.lastName.trim() !== "" ||
      brideFather.firstName.trim() !== "" ||
      brideFather.lastName.trim() !== "" ||
      brideMother.firstName.trim() !== "" ||
      brideMother.lastName.trim() !== "" ||
      confirmantName.firstName.trim() !== "" ||
      confirmantName.lastName.trim() !== "" ||
      confirmantContactNumber.trim() !== "" ||
      confirmantDateOfBirth ||
      deceasedName.firstName.trim() !== "" ||
      deceasedName.lastName.trim() !== "" ||
      deceasedDateOfBirth ||
      deceasedDateOfDeath ||
      representativeContactNumber.trim() !== "" ||
      appointeeName.firstName.trim() !== "" ||
      appointeeName.lastName.trim() !== "" ||
      appointeeContactNumber.trim() !== "" ||
      houseAddress.trim() !== "";

    if (!isAnyFieldFilled) {
      router.back();
    } else {
      setDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const userId = auth.currentUser ? auth.currentUser.uid : null;
    if (!userId) {
      setError("User not authenticated. Please log in to set an appointment.");
      return;
    }

    if (!appointmentType) {
      setError("Please select an appointment type");
    } else {
      try {
        await addDoc(collection(db, "appointments"), {
          userId,
          appointmentType,
          status: "Pending",

          date: date ? date.toISOString() : null,

          // Baptismal
          baptismal: {
            child: {
              dateOfBirth: childDateOfBirth
                ? childDateOfBirth.toISOString()
                : null,
              godMothers,
              godFathers,
            },
          },

          // Wedding
          wedding: {
            groom: {
              name: groomName,
              dateOfBirth: groomDateOfBirth
                ? groomDateOfBirth.toISOString()
                : null,
              placeOfBirth: groomPlaceOfBirth,
              citizenship: groomCitizenship,
              occupation: groomOccupation,
              religion: groomReligion,
              civilStatus: groomCivilStatus,
              address: groomAddress,
              father: groomFather,
              mother: groomMother,
            },
            bride: {
              name: brideName,
              dateOfBirth: brideDateOfBirth
                ? brideDateOfBirth.toISOString()
                : null,
              placeOfBirth: bridePlaceOfBirth,
              citizenship: brideCitizenship,
              occupation: brideOccupation,
              religion: brideReligion,
              civilStatus: brideCivilStatus,
              address: brideAddress,
              father: brideFather,
              mother: brideMother,
            },
          },

          // Confirmation
          confirmation: {
            confirmant: {
              name: confirmantName,
              dateOfBirth: confirmantDateOfBirth
                ? confirmantDateOfBirth.toISOString()
                : null,
              contactNumber: confirmantContactNumber,
            },
          },

          // Burial
          burial: {
            deceased: {
              name: deceasedName,
              dateOfBirth: deceasedDateOfBirth
                ? deceasedDateOfBirth.toISOString()
                : null,
              dateOfDeath: deceasedDateOfDeath,
              representativeContactNumber,
            },
          },
          houseBlessing: {
            appointee: {
              name: appointeeName,
              houseAddress: houseAddress,
              contactNumber: appointeeContactNumber,
            },
          },
        });

        setSuccessMessage("Appointment added successfully!");
        setAppointmentType("");
        setDate(null);
        setChildDateOfBirth(null);
        setGodMothers([{ firstName: "", lastName: "", contactNumber: "" }]);
        setGodFathers([{ firstName: "", lastName: "", contactNumber: "" }]);
        router.push("/parishioner/appointments");
      } catch (err: any) {
        setError("Error adding appointment: " + err.message);
      }
    }
  };

  const handleAddGodParent = (type: "mother" | "father") => {
    const newGodParent = { firstName: "", lastName: "", contactNumber: "" };
    if (type === "mother") {
      setGodMothers([...godMothers, newGodParent]);
    } else {
      setGodFathers([...godFathers, newGodParent]);
    }
  };

  const handleRemoveGodParent = (type: "mother" | "father", index: number) => {
    if (type === "mother") {
      setGodMothers(godMothers.filter((_, i) => i !== index));
    } else {
      setGodFathers(godFathers.filter((_, i) => i !== index));
    }
  };

  const handleChangeGodParent = (
    type: "mother" | "father",
    index: number,
    field: string,
    value: string
  ) => {
    const updatedGodParents =
      type === "mother" ? [...godMothers] : [...godFathers];
    updatedGodParents[index][field] = value;
    if (type === "mother") {
      setGodMothers(updatedGodParents);
    } else {
      setGodFathers(updatedGodParents);
    }
  };

  const renderAppointmentFields = (appointmentType: string) => {
    switch (appointmentType) {
      case "baptismal":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2">Date of Birth:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !childDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {childDateOfBirth ? (
                      format(childDateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={childDateOfBirth}
                    onSelect={setChildDateOfBirth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <label className="block mb-2">God Mothers:</label>
              {godMothers.map((mother, index) => (
                <div key={index} className="flex mb-2">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={mother.firstName}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "mother",
                        index,
                        "firstName",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={mother.lastName}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "mother",
                        index,
                        "lastName",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Input
                    type="text"
                    placeholder="Contact Number"
                    value={mother.contactNumber}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "mother",
                        index,
                        "contactNumber",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Button
                    onClick={() => handleRemoveGodParent("mother", index)}
                    variant="outline"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddGodParent("mother");
                }}
                variant="outline"
              >
                <Plus /> Add God Mother
              </Button>
            </div>
            <div className="mb-4">
              <label className="block mb-2">God Fathers:</label>
              {godFathers.map((father, index) => (
                <div key={index} className="flex mb-2">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={father.firstName}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "father",
                        index,
                        "firstName",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={father.lastName}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "father",
                        index,
                        "lastName",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Input
                    type="text"
                    placeholder="Contact Number"
                    value={father.contactNumber}
                    onChange={(e) =>
                      handleChangeGodParent(
                        "father",
                        index,
                        "contactNumber",
                        e.target.value
                      )
                    }
                    className="mr-2"
                  />
                  <Button
                    onClick={() => handleRemoveGodParent("father", index)}
                    variant="outline"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddGodParent("father");
                }}
                variant="outline"
              >
                <Plus /> Add God Father
              </Button>
            </div>
          </>
        );
      case "wedding":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2">Groom's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={groomName.firstName}
                  onChange={(e) =>
                    setGroomName({ ...groomName, firstName: e.target.value })
                  }
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={groomName.lastName}
                  onChange={(e) =>
                    setGroomName({ ...groomName, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Date of Birth:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !groomDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {groomDateOfBirth ? (
                      format(groomDateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={groomDateOfBirth}
                    onSelect={setGroomDateOfBirth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={brideName.firstName}
                  onChange={(e) =>
                    setBrideName({ ...brideName, firstName: e.target.value })
                  }
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={brideName.lastName}
                  onChange={(e) =>
                    setBrideName({ ...brideName, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Date of Birth:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !brideDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {brideDateOfBirth ? (
                      format(brideDateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={brideDateOfBirth}
                    onSelect={setBrideDateOfBirth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Place of Birth:</label>
              <Input
                type="text"
                placeholder="Place of Birth"
                value={groomPlaceOfBirth}
                onChange={(e) => setGroomPlaceOfBirth(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Place of Birth:</label>
              <Input
                type="text"
                placeholder="Place of Birth"
                value={bridePlaceOfBirth}
                onChange={(e) => setBridePlaceOfBirth(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Citizenship:</label>
              <Input
                type="text"
                placeholder="Citizenship"
                value={groomCitizenship}
                onChange={(e) => setGroomCitizenship(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Citizenship:</label>
              <Input
                type="text"
                placeholder="Citizenship"
                value={brideCitizenship}
                onChange={(e) => setBrideCitizenship(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Occupation:</label>
              <Input
                type="text"
                placeholder="Occupation"
                value={groomOccupation}
                onChange={(e) => setGroomOccupation(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Occupation:</label>
              <Input
                type="text"
                placeholder="Occupation"
                value={brideOccupation}
                onChange={(e) => setBrideOccupation(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Religion:</label>
              <Input
                type="text"
                placeholder="Religion"
                value={groomReligion}
                onChange={(e) => setGroomReligion(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Religion:</label>
              <Input
                type="text"
                placeholder="Religion"
                value={brideReligion}
                onChange={(e) => setBrideReligion(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Civil Status:</label>
              <Input
                type="text"
                placeholder="Civil Status"
                value={groomCivilStatus}
                onChange={(e) => setGroomCivilStatus(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Civil Status:</label>
              <Input
                type="text"
                placeholder="Civil Status"
                value={brideCivilStatus}
                onChange={(e) => setBrideCivilStatus(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Address:</label>
              <Input
                type="text"
                placeholder="Address"
                value={groomAddress}
                onChange={(e) => setGroomAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Address:</label>
              <Input
                type="text"
                placeholder="Address"
                value={brideAddress}
                onChange={(e) => setBrideAddress(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Father's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="Father's First Name"
                  value={groomFather.firstName}
                  onChange={(e) =>
                    setGroomFather({
                      ...groomFather,
                      firstName: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <Input
                  type="text"
                  placeholder="Father's Last Name"
                  value={groomFather.lastName}
                  onChange={(e) =>
                    setGroomFather({ ...groomFather, lastName: e.target.value })
                  }
                  className="mr-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Groom's Mother's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="Mother's First Name"
                  value={groomMother.firstName}
                  onChange={(e) =>
                    setGroomMother({
                      ...groomMother,
                      firstName: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <Input
                  type="text"
                  placeholder="Mother's Last Name"
                  value={groomMother.lastName}
                  onChange={(e) =>
                    setGroomMother({ ...groomMother, lastName: e.target.value })
                  }
                  className="mr-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Father's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="Father's First Name"
                  value={brideFather.firstName}
                  onChange={(e) =>
                    setBrideFather({
                      ...brideFather,
                      firstName: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <Input
                  type="text"
                  placeholder="Father's Last Name"
                  value={brideFather.lastName}
                  onChange={(e) =>
                    setBrideFather({ ...brideFather, lastName: e.target.value })
                  }
                  className="mr-2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Bride's Mother's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="Mother's First Name"
                  value={brideMother.firstName}
                  onChange={(e) =>
                    setBrideMother({
                      ...brideMother,
                      firstName: e.target.value,
                    })
                  }
                  className="mr-2"
                />
                <Input
                  type="text"
                  placeholder="Mother's Last Name"
                  value={brideMother.lastName}
                  onChange={(e) =>
                    setBrideMother({ ...brideMother, lastName: e.target.value })
                  }
                  className="mr-2"
                />
              </div>
            </div>
          </>
        );
      case "confirmation":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2">Confirmant's Full Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={confirmantName.firstName}
                  onChange={(e) =>
                    setConfirmantName({
                      ...confirmantName,
                      firstName: e.target.value,
                    })
                  }
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={confirmantName.lastName}
                  onChange={(e) =>
                    setConfirmantName({
                      ...confirmantName,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Confirmant's Contact Number:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="Enter Contact Number"
                  value={confirmantContactNumber}
                  onChange={(e) => setConfirmantContactNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Date of Birth:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !confirmantDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {confirmantDateOfBirth ? (
                      format(confirmantDateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={confirmantDateOfBirth}
                    onSelect={setConfirmantDateOfBirth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        );
      case "burial":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2">Deceased Person's Name:</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={deceasedName.firstName}
                  onChange={(e) =>
                    setDeceasedName({
                      ...deceasedName,
                      firstName: e.target.value,
                    })
                  }
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={deceasedName.lastName}
                  onChange={(e) =>
                    setDeceasedName({
                      ...deceasedName,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Date of Birth:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deceasedDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {deceasedDateOfBirth ? (
                      format(deceasedDateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deceasedDateOfBirth}
                    onSelect={setDeceasedDateOfBirth}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Date of Death:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deceasedDateOfDeath && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {deceasedDateOfDeath ? (
                      format(deceasedDateOfDeath, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deceasedDateOfDeath}
                    onSelect={setDeceasedDateOfDeath}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <label className="block mb-2">
                Representative Contact Number
              </label>
              <Input
                type="text"
                placeholder="Enter Contact Number"
                value={representativeContactNumber}
                onChange={(e) => setRepresentativeContactNumber(e.target.value)}
              />
            </div>
          </>
        );
      case "houseBlessing":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-2">Appointee's Full Name</label>
              <div className="flex gap-x-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={appointeeName.firstName}
                  onChange={(e) =>
                    setAppointeeName({
                      ...appointeeName,
                      firstName: e.target.value,
                    })
                  }
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={appointeeName.lastName}
                  onChange={(e) =>
                    setAppointeeName({
                      ...appointeeName,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Appointee Contact Number</label>
              <Input
                type="text"
                placeholder="Enter Contact Number"
                value={appointeeContactNumber}
                onChange={(e) => setAppointeeContactNumber(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Complete Address</label>
              <Input
                type="text"
                placeholder="Enter House Address"
                value={houseAddress}
                onChange={(e) => setHouseAddress(e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // useEffect(() => {
  //   if (error || successMessage) {
  //     setTimeout(() => {
  //       setError(null);
  //       setSuccessMessage(null);
  //     }, 5000);
  //   }
  // }, [error, successMessage]);

  return (
    <div className="w-full h-full flex items-center justify-center py-20">
      <form onSubmit={handleSubmit} className="mt-4 w-[600px] p-4 rounded-lg  ">
        <h2 className="text-3xl font-bold mb-10">Schedule an Appointment</h2>
        {error && (
          <p className="text-red-600 bg-red-100 px-2 py-2 mb-2 rounded-md text-center">
            {error}
          </p>
        )}
        {successMessage && (
          <p className="text-green-600 bg-green-100 px-2 py-2 mb-2 rounded-md text-center">
            {successMessage}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-2">Appointment Type:</label>
          <DropdownMenu>
            <DropdownMenuTrigger className="border text-start pl-4 py-1 rounded-md w-full">
              {formatAppointmentType(appointmentType) ||
                "Select Appointment Type"}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Appointment Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAppointmentType("baptismal")}>
                Baptismal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAppointmentType("wedding")}>
                Wedding
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAppointmentType("confirmation")}
              >
                Confirmation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAppointmentType("burial")}>
                Burial
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAppointmentType("houseBlessing")}
              >
                House Blessing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Appointment Date:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {renderAppointmentFields(appointmentType)}

        <div className="flex items-center gap-x-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            className="w-full p-2 rounded-md border border-primary text-primary hover:bg-primary/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full p-2 rounded-md bg-primary text-white hover:bg-hover"
          >
            Schedule Appointment
          </button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>You have unsaved changes.</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave this page without saving your
                progress?
              </DialogDescription>
              <div className="flex gap-x-4 justify-end">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    router.back();
                  }}
                  variant="secondary"
                >
                  Yes
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setDialogOpen(false);
                  }}
                  variant="default"
                >
                  No
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default SetAppoinent;
