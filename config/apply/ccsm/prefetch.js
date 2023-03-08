export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  // 'ObservationCore': 'Observation?patient={{context.patientId}}&category=core-characteristics',
  // 'ObservationLab': 'Observation?patient={{context.patientId}}&category=laboratory',
  // 'ObservationLabor': 'Observation?patient={{context.patientId}}&category=labor-delivery',
  // 'ObservationObGyn': 'Observation?patient={{context.patientId}}&category=obstetrics-gynecology',
  // 'ObservationSmart': 'Observation?patient={{context.patientId}}&category=smartdata',
  // 'Condition': 'Condition?patient={{context.patientId}}',
  // 'ConditionProblem': 'Condition?patient={{context.patientId}}&category=problem-list-item&clinical-status=active',
  'MedicationRequest': 'MedicationRequest?patient={{context.patientId}}',
  'Procedure': 'Procedure?patient={{context.patientId}}',
  'DiagnosticReport': 'DiagnosticReport?patient={{context.patientId}}',
  'Encounter': 'Encounter?patient={{context.patientId}}',
  'Immunization': 'Immunization?patient={{context.patientId}}'
};