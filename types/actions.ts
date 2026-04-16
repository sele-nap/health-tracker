export type AppointmentState = {
  errors?: {
    title?: string[];
    doctorName?: string[];
    specialty?: string[];
    location?: string[];
    scheduledAt?: string[];
    durationMin?: string[];
    purpose?: string[];
    _form?: string[];
  };
};

export type AppointmentSummaryState = {
  success?: boolean;
  errors?: { summary?: string[]; _form?: string[] };
};

export type MedicationState = {
  errors?: {
    name?: string[];
    dosage?: string[];
    form?: string[];
    prescribedBy?: string[];
    startDate?: string[];
    endDate?: string[];
    instructions?: string[];
    _form?: string[];
  };
};

export type SymptomLogState = {
  errors?: {
    loggedAt?: string[];
    overallMood?: string[];
    energyLevel?: string[];
    sleepHours?: string[];
    sleepQuality?: string[];
    stressLevel?: string[];
    notes?: string[];
    _form?: string[];
  };
};

export type ConditionState = {
  errors?: { name?: string[]; diagnosedAt?: string[]; _form?: string[] };
};

export type NoteState = {
  success?: boolean;
  errors?: { content?: string[]; _form?: string[] };
};

export type UpdateNameState = {
  success?: boolean;
  errors?: { name?: string[]; _form?: string[] };
};

export type ChangePasswordState = {
  success?: boolean;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    _form?: string[];
  };
};
