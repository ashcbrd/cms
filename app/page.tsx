import FeatureHighlight from "@/components/feature-highlight";
import Navbar from "@/components/navbar";
import { featureHighlights } from "@/data/feature-highlights";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center bg-white">
      <Navbar />
      <div className="h-full flex flex-col gap-y-10 items-center justify-center max-w-6xl">
        <div className="w-max mx-auto flex flex-col items-center gap-y-4">
          <h1 className="main-text-color text-6xl font-bold py-1 text-center">
            Church Management System
          </h1>
          <p className="max-w-[600px] text-center">
            Embrace Your Faith with Ease at Jaro Church: Conveniently Set Your
            Mass Appointments and Gather in Community and Prayer.
          </p>
        </div>
        <div className="flex mx-auto gap-x-4 items-center">
          <p className="px-4 py-1 border rounded-full bg-primary text-white text-xs">
            Login
          </p>
          <FaLongArrowAltRight color="#6f6f6f" />
          <p className="px-4 py-1 border rounded-full bg-primary text-white text-xs">
            Select
          </p>
          <FaLongArrowAltRight color="#6f6f6f" />
          <p className="px-4 py-1 border rounded-full bg-primary text-white text-xs">
            Book
          </p>
          <FaLongArrowAltRight color="#6f6f6f" />
          <p className="px-4 py-1 border rounded-full bg-primary text-white text-xs">
            Confirm
          </p>
          <FaLongArrowAltRight color="#6f6f6f" />
          <p className="px-4 py-1 border rounded-full bg-primary text-white text-xs">
            Feedback
          </p>
        </div>
        <div className="flex gap-x-10 w-max mx-auto">
          {featureHighlights.map((item, index) => (
            <FeatureHighlight
              index={index}
              key={index}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
