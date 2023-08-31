export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  'ConditionEncounterDiagnosis': 'Condition?patient={{context.patientId}}&category=encounter-diagnosis&clinical-status=active',
  'ConditionProblem': 'Condition?patient={{context.patientId}}&category=problem-list-item&clinical-status=active',
  'ConditionMedicalHistory': 'Condition?patient={{context.patientId}}&category=medical-history&clinical-status=active',
  'MedicationRequest': 'MedicationRequest?patient={{context.patientId}}&status=active&intent=order',
  'ProcedureOrders': 'Procedure?patient={{context.patientId}}&category=103693007',
  'ProcedureSurgerical': 'Procedure?patient={{context.patientId}}&category=387713003',
  'DiagnosticReport': 'DiagnosticReport?patient={{context.patientId}}&category=LAB',
  'Encounter': 'Encounter/{{context.encounterId}}',
  'Immunization': 'Immunization?patient={{context.patientId}}&status=completed'
};