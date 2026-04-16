export type ReminderSchedule = {
  id: string;
  frequency: string;
  times: string[];
  daysOfWeek: number[];
  reminderEnabled: boolean;
};
