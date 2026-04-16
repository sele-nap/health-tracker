export type ReportMedication = {
  name: string;
  dosage: string;
  form: string | null;
  prescribedBy: string | null;
  startDate: Date;
  instructions: string | null;
};

export type ReportSymptomLog = {
  loggedAt: Date;
  overallMood: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  sleepHours: number | null;
  notes: string | null;
};

export type ReportAppointment = {
  title: string;
  doctorName: string | null;
  specialty: string | null;
  scheduledAt: Date;
  purpose: string | null;
};
