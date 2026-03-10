<script lang="ts">
  import type { AgreementReminderType } from '$lib/server/agreement-reminders';

  let {
    baseUrl,
    enrollmentId,
    reminderType,
    patientName,
    patientDocument,
    holderName,
    holderEmail,
    expirationDate,
    remainingDays,
    scheduledFor
  }: {
    baseUrl: string;
    enrollmentId: string;
    reminderType: AgreementReminderType;
    patientName: string;
    patientDocument: string;
    holderName: string;
    holderEmail: string;
    expirationDate: string;
    remainingDays: number;
    scheduledFor: string;
  } = $props();

  const patientUrl = `${baseUrl.replace(/\/$/, '')}/admin/pacientes/${enrollmentId}`;
  const daysToShow = Math.max(remainingDays, 0);
  const remainingLabel = remainingDays < 0 ? 'Vencido' : `En ${daysToShow} días`;
</script>

<html lang="es">
  <body>
    <h2>Recordatorio de convenio BPS</h2>
    <p>Tipo de recordatorio: <strong>{reminderType}</strong></p>
    <p>Fecha programada: <strong>{scheduledFor}</strong></p>
    <p>Vencimiento del convenio: <strong>{expirationDate}</strong></p>
    <p>Días restantes: <strong>{remainingLabel}</strong></p>
    <hr />
    <p>Paciente: {patientName}</p>
    <p>Documento: {patientDocument}</p>
    <p>Titular: {holderName}</p>
    <p>Email titular: {holderEmail}</p>
    <p>
      <a href={patientUrl}>Ver ficha del paciente</a>
    </p>
  </body>
</html>
