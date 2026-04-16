export type CalendarAppointment = {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  doctorName: string | null;
};

export type AppointmentNote = {
  id: string;
  content: string;
  createdAt: string;
};
