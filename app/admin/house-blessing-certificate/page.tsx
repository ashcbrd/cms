"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

interface HouseBlessingCertificateParams {
  parishionerName: string;
  houseBlessingDate: string;
  priestName: string;
}

function HouseBlessingCertificateContent() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const params: HouseBlessingCertificateParams = {
    parishionerName:
      searchParams.get("parishionerName") || "Unknown Parishioner",
    houseBlessingDate: searchParams.get("houseBlessingDate") || "Unknown Date",
    priestName: searchParams.get("priestName") || "Unknown Priest",
  };

  const { parishionerName, houseBlessingDate, priestName } = params;

  const handleDownload = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `House_Blessing_Certificate_${parishionerName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div
        ref={certificateRef}
        className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-12 relative overflow-hidden border-2 border-green-200"
      >
        <div className="absolute top-8 right-8 text-green-200">
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-green-800 mb-4">
            House Blessing
          </h1>
          <p className="text-lg text-green-600">
            On{" "}
            <span className="font-semibold">
              {format(new Date(houseBlessingDate), "MMMM d, yyyy")}
            </span>
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-green-900">
            The House Of <span className="font-bold">{parishionerName}</span>
          </h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl text-green-700">And all who attended</p>
          <p className="text-xl text-green-700">Was Blessed and Sanctified</p>
          <p className="text-xl text-green-700">
            May Health and Happiness Abide Here Always
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-green-600">Blessed by</p>
          <p className="text-2xl font-serif text-green-800">Fr. {priestName}</p>
        </div>

        <div className="absolute bottom-8 right-8 w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-800 text-sm font-bold border-2 border-green-200">
          Seal
        </div>
      </div>

      <Button onClick={handleDownload} className="mt-10">
        Download Certificate
      </Button>
    </div>
  );
}

export default function HouseBlessingCertificatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HouseBlessingCertificateContent />
    </Suspense>
  );
}
