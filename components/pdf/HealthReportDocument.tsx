import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1210",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: "#fdf8f2",
  },
  header: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d4b896",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1a1210",
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: "#8a7060",
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1a1210",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d4b896",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8ddd4",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 5,
    backgroundColor: "#f0e8dc",
    marginBottom: 2,
  },
  cell: {
    flex: 1,
    fontSize: 9,
    color: "#3a2e24",
    paddingRight: 4,
  },
  cellBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1210",
    paddingRight: 4,
  },
  medRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8ddd4",
    gap: 8,
  },
  medName: {
    width: 160,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1210",
  },
  medDetail: {
    flex: 1,
    fontSize: 9,
    color: "#3a2e24",
  },
  emptyText: {
    fontSize: 9,
    color: "#8a7060",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#b0a090",
  },
});

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

type Props = {
  generatedAt: Date;
  userName: string | null;
  medications: ReportMedication[];
  symptomLogs: ReportSymptomLog[];
  upcomingAppointments: ReportAppointment[];
};

export function HealthReportDocument({
  generatedAt,
  userName,
  medications,
  symptomLogs,
  upcomingAppointments,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Report</Text>
          <Text style={styles.headerMeta}>
            {userName ? `${userName} · ` : ""}Generated {formatDate(generatedAt)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Medications</Text>
          {medications.length === 0 ? (
            <Text style={styles.emptyText}>No active medications.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.cellBold, { width: 160 }]}>Name</Text>
                <Text style={styles.cellBold}>Dosage</Text>
                <Text style={styles.cellBold}>Form</Text>
                <Text style={styles.cellBold}>Prescribed by</Text>
                <Text style={styles.cellBold}>Since</Text>
              </View>
              {medications.map((med, i) => (
                <View key={i} style={styles.medRow}>
                  <Text style={[styles.medName]}>{med.name}</Text>
                  <Text style={styles.medDetail}>{med.dosage}</Text>
                  <Text style={styles.medDetail}>{med.form ?? "—"}</Text>
                  <Text style={styles.medDetail}>{med.prescribedBy ?? "—"}</Text>
                  <Text style={styles.medDetail}>{formatDateShort(med.startDate)}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Symptom Log — Last 30 days ({symptomLogs.length} entries)
          </Text>
          {symptomLogs.length === 0 ? (
            <Text style={styles.emptyText}>No entries in this period.</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.cellBold, { width: 72 }]}>Date</Text>
                <Text style={styles.cellBold}>Mood</Text>
                <Text style={styles.cellBold}>Energy</Text>
                <Text style={styles.cellBold}>Stress</Text>
                <Text style={styles.cellBold}>Sleep</Text>
                <Text style={[styles.cellBold, { flex: 2 }]}>Notes</Text>
              </View>
              {symptomLogs.map((log, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.cell, { width: 72 }]}>
                    {formatDateShort(log.loggedAt)}
                  </Text>
                  <Text style={styles.cell}>{log.overallMood ?? "—"}</Text>
                  <Text style={styles.cell}>{log.energyLevel ?? "—"}</Text>
                  <Text style={styles.cell}>{log.stressLevel ?? "—"}</Text>
                  <Text style={styles.cell}>
                    {log.sleepHours !== null ? `${log.sleepHours}h` : "—"}
                  </Text>
                  <Text style={[styles.cell, { flex: 2 }]}>
                    {log.notes ? log.notes.slice(0, 80) + (log.notes.length > 80 ? "…" : "") : ""}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingAppointments.map((appt, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cellBold, { flex: 2 }]}>{appt.title}</Text>
                <Text style={styles.cell}>
                  {appt.doctorName ?? ""}
                  {appt.specialty ? ` · ${appt.specialty}` : ""}
                </Text>
                <Text style={styles.cell}>{formatDateTime(appt.scheduledAt)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Health Tracker · Confidential · {formatDate(generatedAt)}
        </Text>
      </Page>
    </Document>
  );
}
