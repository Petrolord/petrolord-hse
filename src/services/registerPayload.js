// Form payloads for the public.hse_* register tables. The forms keep an
// unpicked <Select> as '' (e.g. location_id, auditor_id, assigned_site_id),
// and '' is not a uuid: Postgres rejects the whole insert with 22P02. An
// unpicked reference is NULL, so every blank *_id becomes null here. Other
// fields are passed through untouched.
export function blankIdsToNull(payload = {}) {
  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    out[key] = (key === 'id' || key.endsWith('_id')) && typeof value === 'string' && value.trim() === ''
      ? null
      : value;
  }
  return out;
}
