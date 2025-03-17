"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

interface ConfirmationCertificateParams {
  parishionerName: string;
  confirmationDate: string;
  priestName: string;
}

function ConfirmationCertificateContent() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const params: ConfirmationCertificateParams = {
    parishionerName:
      searchParams.get("parishionerName") || "Unknown Parishioner",
    confirmationDate: searchParams.get("confirmationDate") || "Unknown Date",
    priestName: searchParams.get("priestName") || "Unknown Priest",
  };

  const { parishionerName, confirmationDate, priestName } = params;

  const handleDownload = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Confirmation_Certificate_${parishionerName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-8">
      <div
        ref={certificateRef}
        className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-12 relative overflow-hidden border-2 border-purple-200"
      >
        <div className="absolute top-8 right-8 text-purple-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-purple-800 mb-4">
            Certificate of Confirmation
          </h1>
          <p className="text-lg text-purple-600">This certifies that</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-purple-900">
            <span className="font-bold">{parishionerName}</span>
          </h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl text-purple-700">
            Having been duly instructed in the Doctrines and Duties of the
            Church
          </p>
          <p className="text-xl text-purple-700">
            Has been Confirmed on{" "}
            <span className="font-semibold text-purple-800">
              {format(new Date(confirmationDate), "MMMM d, yyyy")}
            </span>
          </p>
          <p className="text-xl text-purple-700">
            At Jaro Cathedral, Iloilo City
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-purple-600">Officiated by</p>
          <p className="text-2xl font-serif text-purple-800">
            Fr. {priestName}
          </p>
        </div>

        <div className="absolute bottom-8 right-8 w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 text-sm font-bold border-2 border-purple-200">
          Seal
        </div>
      </div>

      <Button onClick={handleDownload} className="mt-10">
        Download Certificate
      </Button>
    </div>
  );
}

export default function ConfirmationCertificatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationCertificateContent />
    </Suspense>
  );
}
