"use client";

import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import html2canvas from "html2canvas";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";

interface DeathCertificateParams {
  deceasedName: string;
  dateOfDeath: string;
  priestName: string;
}

function DeathCertificateContent() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const params: DeathCertificateParams = {
    deceasedName: searchParams.get("deceasedName") || "Unknown Deceased",
    dateOfDeath: searchParams.get("dateOfDeath") || "Unknown Date",
    priestName: searchParams.get("priestName") || "Unknown Priest",
  };

  const { deceasedName, dateOfDeath, priestName } = params;

  const handleDownload = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Death_Certificate_${deceasedName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div
        ref={certificateRef}
        className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-12 relative overflow-hidden border-2 border-gray-200"
      >
        <div className="absolute top-8 right-8 text-gray-200">
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
          <h1 className="text-5xl font-serif text-gray-800 mb-4">
            CERTIFICATION OF DEATH
          </h1>
          <p className="text-lg text-gray-600">
            This is to acknowledge the death of
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-gray-900">
            <span className="font-bold">{deceasedName}</span>
          </h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl text-gray-700">
            On{" "}
            <span className="font-semibold">
              {formatDate(dateOfDeath, "MMMM d, yyy")}
            </span>
          </p>
          <p className="text-xl text-gray-700">At Jaro Cathedral</p>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600">Certified by</p>
          <p className="text-2xl font-serif text-gray-800">Fr. {priestName}</p>
        </div>

        <div className="absolute bottom-8 right-8 w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-800 text-sm font-bold border-2 border-gray-200">
          Seal
        </div>
      </div>

      <Button onClick={handleDownload} className="mt-10">
        Download Certificate
      </Button>
    </div>
  );
}

export default function DeathCertificatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeathCertificateContent />
    </Suspense>
  );
}
