"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

interface BaptismCertificateParams {
  babyName: string;
  baptismDate: string;
  priestName: string;
}

function BaptismCertificateContent() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const params: BaptismCertificateParams = {
    babyName: searchParams.get("babyName") || "Unknown Baby",
    baptismDate: searchParams.get("baptismDate") || "Unknown Date",
    priestName: searchParams.get("priestName") || "Unknown Priest",
  };

  const { babyName, baptismDate, priestName } = params;

  const handleDownload = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Baptism_Certificate_${babyName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div
        ref={certificateRef}
        className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-12 relative overflow-hidden border border-blue-100"
      >
        <div className="absolute top-8 right-8 text-blue-200">
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
              d="M12 2C8.134 2 5 5.134 5 9c0 5 7 13 7 13s7-8 7-13c0-3.866-3.134-7-7-7z"
            />
          </svg>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-blue-800 mb-4">
            Certificate of Baptism
          </h1>
          <p className="text-lg text-blue-600">This certifies that</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-blue-900">
            <span className="font-bold">{babyName}</span>
          </h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl text-blue-700">
            Was received into church fellowship by water baptism on{" "}
            <span className="font-semibold text-blue-800">
              {format(new Date(baptismDate), "MMMM d, yyyy")}
            </span>
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-blue-600">Officiated by</p>
          <p className="text-2xl font-serif text-blue-800">Fr. {priestName}</p>
        </div>

        <div className="absolute bottom-8 right-8 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-sm font-bold border-2 border-blue-200">
          Seal
        </div>
      </div>

      <Button onClick={handleDownload} className="mt-10">
        Download Certificate
      </Button>
    </div>
  );
}

export default function BaptismCertificatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BaptismCertificateContent />
    </Suspense>
  );
}
