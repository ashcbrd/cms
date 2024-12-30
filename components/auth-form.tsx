"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface AuthFormProps {
  isLogin: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordValidation, setPasswordValidation] = useState<any>({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });
  const router = useRouter();

  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 6,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
    };
    setPasswordValidation(validations);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    validatePassword(password);

    if (isLogin) {
      try {
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
              router.push("/parishioner/dashboard");
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
      } catch (err: any) {
        setError("Invalid credentials. Please try again.");
      }
    } else {
      if (
        !passwordValidation.length ||
        !passwordValidation.number ||
        !passwordValidation.uppercase ||
        !passwordValidation.lowercase
      ) {
        setError(
          "Password must be at least 6 characters, include a number, an uppercase letter, and a lowercase letter."
        );
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const userData = {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          role: "Parishioner",
        };
        await setDoc(doc(db, "users", user.uid), userData);
        alert("Registered successfully");
        router.push("/parishioner/dashboard");
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          setError("The email address is already in use by another account.");
        } else if (err.code === "auth/invalid-email") {
          setError("The email address is not valid.");
        } else if (err.code === "auth/weak-password") {
          setError(
            "The password is too weak. Please choose a stronger password."
          );
        } else {
          setError(err.message);
        }
      }
    }

    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  useEffect(() => {
    setError("");
  }, [firstName, lastName, email, password]);

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!isLogin && (
        <div className="mb-4">
          <label className="block mb-2">First Name</label>
          <Input
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
      )}
      {!isLogin && (
        <div className="mb-4">
          <label className="block mb-2">Last Name</label>
          <Input
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-2">Email</label>
        <Input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Password</label>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
        />
        {!isLogin && password.length > 0 && (
          <ul className="text-gray-600 text-sm mt-4">
            <li
              className={`flex gap-x-1 items-center ${
                passwordValidation.length ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordValidation.length ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}{" "}
              At least 6 characters
            </li>
            <li
              className={`flex gap-x-1 items-center ${
                passwordValidation.number ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordValidation.number ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}{" "}
              At least one number
            </li>
            <li
              className={`flex gap-x-1 items-center ${
                passwordValidation.uppercase ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordValidation.uppercase ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}{" "}
              At least one uppercase letter
            </li>
            <li
              className={`flex gap-x-1 ${
                passwordValidation.lowercase ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordValidation.lowercase ? (
                <Check size={16} />
              ) : (
                <X size={16} />
              )}{" "}
              At least one lowercase letter
            </li>
          </ul>
        )}
      </div>
      <Button className="w-full" type="submit">
        {isLogin ? "Login" : "Register"}
      </Button>
    </form>
  );
};

export default AuthForm;
