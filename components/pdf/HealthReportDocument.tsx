import { pdfColors } from '@/lib/colors';
import type { en } from '@/lib/i18n';
import type {
  ReportAppointment,
  ReportMedication,
  ReportSymptomLog,
} from '@/types/pdf';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type { ReportAppointment, ReportMedication, ReportSymptomLog };

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: pdfColors.text,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: pdfColors.pageBg,
  },
  header: {
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: pdfColors.textMuted,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.borderLight,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    backgroundColor: pdfColors.tableHeaderBg,
    marginBottom: 2,
  },
  cell: {
    flex: 1,
    fontSize: 9,
    color: pdfColors.textSecondary,
    paddingRight: 4,
  },
  cellBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    paddingRight: 4,
  },
  medRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.borderLight,
    gap: 8,
  },
  medName: {
    width: 160,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
  },
  medDetail: {
    flex: 1,
    fontSize: 9,
    color: pdfColors.textSecondary,
  },
  emptyText: {
    fontSize: 9,
    color: pdfColors.textEmpty,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    textAlign: 'center',
    fontSize: 8,
    color: pdfColors.footer,
  },
});

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  generatedAt: Date;
  userName: string | null;
  medications: ReportMedication[];
  symptomLogs: ReportSymptomLog[];
  upcomingAppointments: ReportAppointment[];
  tr: typeof en;
};

export function HealthReportDocument({
  generatedAt,
  userName,
  medications,
  symptomLogs,
  upcomingAppointments,
  tr,
}: Props) {
  const dateLocale = tr.dateLocale;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tr.pdf.title}</Text>
          <Text style={styles.headerMeta}>
            {tr.pdf.generatedBy(userName, formatDate(generatedAt, dateLocale))}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr.pdf.activeMeds}</Text>
          {medications.length === 0 ? (
            <Text style={styles.emptyText}>{tr.pdf.noMeds}</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.cellBold, { width: 160 }]}>
                  {tr.pdf.colName}
                </Text>
                <Text style={styles.cellBold}>{tr.pdf.colDosage}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colForm}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colPrescribedBy}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colSince}</Text>
              </View>
              {medications.map((med, i) => (
                <View key={i} style={styles.medRow}>
                  <Text style={[styles.medName]}>{med.name}</Text>
                  <Text style={styles.medDetail}>{med.dosage}</Text>
                  <Text style={styles.medDetail}>{med.form ?? '—'}</Text>
                  <Text style={styles.medDetail}>
                    {med.prescribedBy ?? '—'}
                  </Text>
                  <Text style={styles.medDetail}>
                    {formatDateShort(med.startDate, dateLocale)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {tr.pdf.symptomLog(symptomLogs.length)}
          </Text>
          {symptomLogs.length === 0 ? (
            <Text style={styles.emptyText}>{tr.pdf.noEntries}</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.cellBold, { width: 72 }]}>
                  {tr.pdf.colDate}
                </Text>
                <Text style={styles.cellBold}>{tr.pdf.colMood}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colEnergy}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colStress}</Text>
                <Text style={styles.cellBold}>{tr.pdf.colSleep}</Text>
                <Text style={[styles.cellBold, { flex: 2 }]}>
                  {tr.pdf.colNotes}
                </Text>
              </View>
              {symptomLogs.map((log, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.cell, { width: 72 }]}>
                    {formatDateShort(log.loggedAt, dateLocale)}
                  </Text>
                  <Text style={styles.cell}>{log.overallMood ?? '—'}</Text>
                  <Text style={styles.cell}>{log.energyLevel ?? '—'}</Text>
                  <Text style={styles.cell}>{log.stressLevel ?? '—'}</Text>
                  <Text style={styles.cell}>
                    {log.sleepHours !== null ? `${log.sleepHours}h` : '—'}
                  </Text>
                  <Text style={[styles.cell, { flex: 2 }]}>
                    {log.notes
                      ? log.notes.slice(0, 80) +
                        (log.notes.length > 80 ? '…' : '')
                      : ''}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tr.pdf.upcomingAppts}</Text>
            {upcomingAppointments.map((appt, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cellBold, { flex: 2 }]}>{appt.title}</Text>
                <Text style={styles.cell}>
                  {appt.doctorName ?? ''}
                  {appt.specialty ? ` · ${appt.specialty}` : ''}
                </Text>
                <Text style={styles.cell}>
                  {formatDateTime(appt.scheduledAt, dateLocale)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          {tr.pdf.footer(formatDate(generatedAt, dateLocale))}
        </Text>
      </Page>
    </Document>
  );
}
