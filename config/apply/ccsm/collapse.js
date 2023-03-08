
export function collapseIntoOne(cards) {
  let justOne = [{}];
  let decisionAids = cards.filter(c => c.summary.includes('Decision Aids'));
  if (decisionAids.length > 0) {
    let aidObject = JSON.parse(decisionAids[0].detail);
    justOne = [{
      ...decisionAids[0],
      summary: aidObject.recommendation,
      detail: aidObject.recommendationDetails.join('\n\n')
    }];
  }
  let patientHistory = cards.filter(c => c.summary.includes('history'));
  if (patientHistory.length > 0) {
    let histObject = JSON.parse(patientHistory[0].detail);
    justOne = [{
      ...justOne[0],
      detail: justOne[0].detail + 
        '\n\n' +
        '### Patient History\n\n' +
        '#### Conditions\n\n' +
        '* ' + histObject.patientHistory.conditions.join('\n\n* ') + '\n\n' +
        '#### Observations\n\n' +
        '* ' + histObject.patientHistory.observations.join('\n\n* ') + '\n\n' +
        '#### DiagnosticReports\n\n' +
        '* ' + histObject.patientHistory.diagnosticReports.join('\n\n* ') + '\n\n' +
        '#### Procedures\n\n' +
        '* ' + histObject.patientHistory.procedures.join('\n\n* ') + '\n\n' +
        '#### Immunizations\n\n' +
        '* ' + histObject.patientHistory.immunizations.join('\n\n* ')
    }];
  }
  return justOne;
}