export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  'Encounter': 'Encounter/{{context.encounterId}}',
  'EpisodeOfCare': 'EpisodeOfCare?patient={{context.patientId}}&type=urn:oid:1.2.840.114350.1.13.88.2.7.2.726668|6,urn:oid:1.2.840.114350.1.13.88.3.7.2.726668|6',
};