"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthFormProps {
  isLogin: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          switch (userData.role) {
            case "parishioner":
              router.push("/parishioner");
              break;
            case "admin":
              router.push("/admin");
              break;
            case "priest":
              router.push("/priest");
              break;
            case "altarServer":
              router.push("/altar-server");
              break;
            case "altarServerPresident":
              router.push("/altar-server-president");
              break;
            default:
              alert("No matching role found, redirecting to home.");
              router.push("/");
          }
        } else {
          setError("User data not found.");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const userData = {
          uid: user.uid,
          email: user.email,
          role: "Parishioner",
        };
        await setDoc(doc(db, "users", user.uid), userData);
        alert("Registered successfully");
        router.push("/parishioner");
      }
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? "Log in" : "Register"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
};

export default AuthForm;
