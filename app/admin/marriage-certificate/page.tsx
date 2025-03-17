"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useRef, Suspense } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

interface MarriageCertificateParams {
  groomFirstName: string;
  groomLastName: string;
  brideFirstName: string;
  brideLastName: string;
  weddingDate: string;
  priestName: string;
}

function MarriageCertificateContent() {
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const params: MarriageCertificateParams = {
    groomFirstName: searchParams.get("groomFirstName") || "Unknown Groom",
    groomLastName: searchParams.get("groomLastName") || "",
    brideFirstName: searchParams.get("brideFirstName") || "Unknown Bride",
    brideLastName: searchParams.get("brideLastName") || "",
    weddingDate: searchParams.get("weddingDate") || "Unknown Date",
    priestName: searchParams.get("priestName") || "Unknown Priest",
  };

  const {
    groomFirstName,
    groomLastName,
    brideFirstName,
    brideLastName,
    weddingDate,
    priestName,
  } = params;

  const handleDownload = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `Marriage_Certificate_${groomFirstName}_${brideFirstName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div
        ref={certificateRef}
        className="w-full max-w-3xl bg-white border-2 border-[#D4AF37] rounded-lg shadow-2xl p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[#D4AF37]"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#D4AF37] transform -translate-y-1/2"></div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-[#D4AF37] mb-4">
            Marriage Certificate
          </h1>
          <p className="text-lg text-gray-600">
            This certifies the holy union of
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif text-gray-800">
            <span className="font-bold">
              {groomFirstName} {groomLastName}
            </span>
            <span className="mx-4 text-[#D4AF37]">&</span>
            <span className="font-bold">
              {brideFirstName} {brideLastName}
            </span>
          </h2>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl text-gray-700">
            Who were joined together in marriage on{" "}
            <span className="font-semibold text-[#D4AF37]">
              {format(new Date(weddingDate), "MMMM d, yyyy")}
            </span>
          </p>
          <p className="text-xl text-gray-700">
            at Jaro Cathedral, Iloilo City
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600">
            The ceremony was officiated by
          </p>
          <p className="text-2xl font-serif text-[#D4AF37]">Fr. {priestName}</p>
        </div>

        <div className="absolute bottom-8 right-8 w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center text-white text-sm font-bold">
          Seal
        </div>
      </div>

      <Button onClick={handleDownload} className="mt-10">
        Download Certificate
      </Button>
    </div>
  );
}

export default function MarriageCertificatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarriageCertificateContent />
    </Suspense>
  );
}
