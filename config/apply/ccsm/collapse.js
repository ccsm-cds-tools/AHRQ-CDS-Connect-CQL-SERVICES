
export function collapseIntoOne(cards) {
  let justOne = [{}];
  let decisionAids = cards.filter(c => c.summary.toLowerCase().includes('decision aids'));
  let errors = cards.filter(c => c.summary.toLowerCase().includes('errors'));
  if (errors.length > 0) {
    let errorObject = JSON.parse(errors[0].detail);
    justOne = [{
      ...errors[0],
      summary: 'CDS Error',
      detail: errorObject.join('\n') ?? 'The CDS has returned an error.'
    }];
  } else if (decisionAids.length > 0) {
    let aidObject = JSON.parse(decisionAids[0].detail);
    justOne = [{
      ...decisionAids[0],
      summary: aidObject.recommendation,
      detail: aidObject.recommendationDetails.join('\n\n')
    }];
  } else {
    justOne = [{
      summary: 'No Recommendation',
      uuid: '1',
      indicator: 'info',
      source: {
        label: 'no source listed'
      },
      links: [],
      detail: 'No recommendation has been returned by the CDS.'
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
        '* ' + histObject.patientHistory.conditions.map(formatEntry).join('\n* ') + '\n\n' +
        '#### Observations\n\n' +
        '* ' + histObject.patientHistory.observations.map(formatEntry).join('\n* ') + '\n\n' +
        '#### DiagnosticReports\n\n' +
        '* ' + histObject.patientHistory.diagnosticReports.map(formatEntry).join('\n* ') + '\n\n' +
        '#### Procedures\n\n' +
        '* ' + histObject.patientHistory.procedures.map(formatEntry).join('\n* ') + '\n\n' +
        '#### Immunizations\n\n' +
        '* ' + histObject.patientHistory.immunizations.map(formatEntry).join('\n* ')
    }];
  }
  return justOne;
}

function formatEntry(ent) {
  let entString = ent.name + ' (' + ent.date + '): ';
  entString = ent.value ? entString + ent.value : entString + 'No result available';
  return entString;
}