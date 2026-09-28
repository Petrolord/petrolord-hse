// Design family (batch 2B): security severity and status as Badge status
// variants, so each colour comes with its word.

/** Severity: Critical is danger, High is warning, the rest info. */
export function severityVariant(severity) {
  if (severity === 'Critical') return 'danger';
  if (severity === 'High') return 'warning';
  return 'info';
}

/** Incident status: Reported waits for triage, Closed is done, the rest are in progress. */
export function statusVariant(status) {
  if (status === 'Reported') return 'warning';
  if (status === 'Closed') return 'success';
  return 'info';
}
