import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

const ManageAccounts: React.FC = () => {
  return <div className="bg-red-500 w-screen h-screen">HELO</div>;
};

export default ManageAccounts;
