import { AiFillSchedule } from "react-icons/ai";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { IoDocumentText } from "react-icons/io5";

const FeatureHighlight = ({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) => {
  const icons = [
    <AiFillSchedule className="text-3xl" color="#d69561" key="schedule" />,
    <RiCalendarScheduleFill
      className="text-3xl"
      color="#d69561"
      key="reminder"
    />,
    <IoDocumentText className="text-3xl" color="#d69561" key="document" />,
  ];
  return (
    <div className="flex flex-col gap-y-2 p-4 border-[1px] bg-white border-gray-500/10 rounded-3xl w-[340px] shadow-xl shadow-gray-500/10 mt-10">
      <div className="flex items-center gap-x-2">
        {icons[index]}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p>{desc}</p>
    </div>
  );
};

export default FeatureHighlight;
