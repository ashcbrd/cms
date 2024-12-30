import React from "react";
import AuthForm from "./auth-form";
import Logo from "./logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-gray-300/50 w-full flex justify-between items-center h-20 max-w-6xl">
      <Logo size="50px" />
      <div></div>
      <div className="flex gap-x-3">
        <Dialog>
          <DialogTrigger className="hover:bg-zinc-100 transition-all rounded-full h-max py-2 px-4 border-[1px] border-gray-500/20">
            Register
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register</DialogTitle>
              <DialogDescription>
                Fill in the details below to create an account.
              </DialogDescription>
            </DialogHeader>
            <AuthForm isLogin={false} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className="hover:bg-[#9f4f2f] transition-all rounded-full h-max py-2 px-4 bg-primary text-white">
            Login
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log in</DialogTitle>
              <DialogDescription>
                Enter your credentials to access your account.
              </DialogDescription>
            </DialogHeader>
            <AuthForm isLogin={true} />
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navbar;
