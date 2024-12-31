import { formatAppointmentType } from "@/lib/format-appointment-type";
import { formatDate } from "@/lib/format-date";

interface Appointment {
  appointmentType: string;
  status: string;
  date: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  return (
    <div className="bg-white flex flex-col items-start gap-y-2 shadow-xl border border-gray-500/10 shadow-gray-300/10 rounded-lg p-4 mb-4 w-full">
      <h3>
        Type:{" "}
        <span className="font-bold text-xl">
          {formatAppointmentType(appointment.appointmentType)}
        </span>
      </h3>
      <p className="flex items-center gap-x-[6px]">
        Status:
        <span
          className={`px-2 py-1 text-white text-xs font-semibold rounded-lg
          
        ${
          appointment.status === "Confirmed"
            ? "bg-green-500"
            : appointment.status === "Denied"
            ? "bg-red-500"
            : "bg-yellow-500"
        }
          `}
        >
          {appointment.status}
        </span>
      </p>
      {appointment.date && (
        <p>
          Date:{" "}
          <span className="font-semibold">
            {formatDate(new Date(appointment.date).toLocaleDateString())}
          </span>
        </p>
      )}
    </div>
  );
};

export default AppointmentCard;
