export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  'Condition': 'Condition?patient={{context.patientId}}&category=problem-list-item,medical-history&clinical-status=active',
  'Procedure': 'Procedure?patient={{context.patientId}}&category=103693007,387713003',
  'Encounter': 'Encounter/{{context.encounterId}}',
};