export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  'Condition': 'Condition?patient={{context.patientId}}&category=problem-list-item,medical-history&clinical-status=active',
  'Procedure': 'Procedure?patient={{context.patientId}}&category=103693007,387713003',
  'Encounter': 'Encounter/{{context.encounterId}}',
  'EpisodeOfCare': 'EpisodeOfCare?patient={{context.patientId}}&type=urn:oid:1.2.840.114350.1.13.88.2.7.2.726668|6,urn:oid:1.2.840.114350.1.13.88.3.7.2.726668|6',
};