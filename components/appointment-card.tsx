import { appointmentTypeFormatter } from "@/lib/appointment-type-formatter";

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
    <div className="bg-white shadow-xl border border-gray-500/10 shadow-gray-300/10 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold">
        {appointmentTypeFormatter(appointment.appointmentType)}
      </h3>
      <p>Status: {appointment.status}</p>
      {appointment.date && (
        <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
      )}
    </div>
  );
};

export default AppointmentCard;
