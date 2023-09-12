export const prefetch = {
  'Patient': 'Patient/{{context.patientId}}',
  'ConditionProblem': 'Condition?patient={{context.patientId}}&category=problem-list-item&clinical-status=active',
  'ConditionMedicalHistory': 'Condition?patient={{context.patientId}}&category=medical-history&clinical-status=active',
  'ProcedureOrders': 'Procedure?patient={{context.patientId}}&category=103693007',
  'ProcedureSurgerical': 'Procedure?patient={{context.patientId}}&category=387713003',
  'DiagnosticReport': 'DiagnosticReport?patient={{context.patientId}}&category=CYTOPATH',
  'Encounter': 'Encounter/{{context.encounterId}}',
};