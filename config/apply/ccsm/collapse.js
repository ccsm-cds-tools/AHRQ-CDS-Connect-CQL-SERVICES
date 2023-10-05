import { marked } from 'marked';
import { getSources } from './formatCards.js';

/**
 *
 * @param {*} cards
 * @returns
 */
export function collapseIntoOne(cards, useHtml=false) {
  const summary = 'Cervical Cancer Decision Support';
  let justOneCard = [{}];

  // Try to consolidate the recommendations
  let decisionAids = cards.filter(c => c.summary.toLowerCase().includes('decision aids'));
  let errors = cards.filter(c => c.summary.toLowerCase().includes('errors'));
  if (errors.length > 0) {
    let details = JSON.parse(errors[0].detail);
    justOneCard = [{
      ...errors[0],
      summary,
      detail: details.join('\n') ?? 'The CDS has encountered an error processing the patient information. Please review patient history and use clinical judgement.\n\n'
    }];
  } else if (decisionAids.length > 0) {
    // Try to deserialize the decision aids
    let details = JSON.parse(decisionAids[0].detail);
    const {
      recommendation,
      recommendationGroup,
      recommendationDetails,
      recommendationDate,
      errors,
      disclaimer,
      suggestedOrders,
      riskTable
    } = details;
    let sources = getSources(decisionAids[0]?.extension?.documentation.filter(d => d.label === recommendationGroup));
    console.log(sources);
    // Generate the markdown details
    let markdown =
      '# ' + recommendation + ' (' + recommendationGroup + ') ' + '\n\n' +
      recommendationDetails.join('\n\n') + '\n\n';
    // Add the markdown to the card
    justOneCard = [{
      ...decisionAids[0],
      summary,
      detail: markdown,
      source: sources[0],
      links: sources.map(s => ({...s,type:'absolute'}))
    }];
  } else {
    justOneCard = [{
      summary,
      uuid: '1',
      indicator: 'info',
      source: {
        label: 'no source listed'
      },
      links: [],
      detail: 'The guidelines do not provide any recommendation for this case. Please use clinical judgement.\n\n'
    }];
  }

  // Try to add in the patient history
  let patientHistory = cards.filter(c => c.summary.includes('history'));
  if (patientHistory.length > 0) {
    let details = JSON.parse(patientHistory[0].detail);
    const {
      patientInfo: {
        name,
        id,
        isPregnant,
        dateOfBirth,
        sexAtBirth,
        age,
        gender,
        primaryLanguage,
        race
      },
      patientHistory: {
        conditions,
        observations,
        medications,
        procedures,
        diagnosticReports,
        encounters,
        immunizations,
        episodeOfCares
      }
    } = details;

    let dob = dateOfBirth.value;

    let markdown =
      '# Patient: ' + name + ' (DOB: ' + dob.month + '/' + dob.day + '/' + dob.year + ')';

    let conditionString = conditions.map(formatEntry).join('\n* ');
    let observationString = observations.map(formatEntry).join('\n* ');
    let medicationString = medications.map(formatEntry).join('\n* ');
    let reportString = diagnosticReports.map(formatEntry).join('\n* ');
    let procedureString = procedures.map(formatEntry).join('\n* ');
    let immunizationString = immunizations.map(formatEntry).join('\n* ');
    let episodeOfCareString = episodeOfCares.map(formatEntry).join('\n* ');

    if (
      conditions.length > 0 ||
      observations.length > 0 ||
      medications.length > 0 ||
      procedures.length > 0 ||
      diagnosticReports.length > 0 ||
      encounters.length > 0 ||
      immunizations.length > 0 ||
      episodeOfCares.length > 0
    ) { markdown = markdown + '\n\n' + '## History' + '\n\n'; }

    if (episodeOfCareString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Pregnancy EpisodeOfCare' + '\n\n' +
        '* ' + episodeOfCareString + '\n\n';
    }

    if (conditionString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Diagnoses' + '\n\n' +
        '* ' + conditionString + '\n\n';
    }
    if (observationString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Observations' + '\n\n' +
        '* ' + observationString + '\n\n';
    }
    if (medicationString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Medications' + '\n\n' +
        '* ' + medicationString + '\n\n';
    }
    if (reportString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Labs' + '\n\n' +
        '* ' + reportString + '\n\n';
    }
    if (procedureString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Procedures' + '\n\n' +
        '* ' + procedureString + '\n\n';
    }
    if (immunizationString.length > 0) {
      markdown = markdown + '\n\n' +
        '### Immunizations' + '\n\n' +
        '* ' + immunizationString + '\n\n';
    }

    let finalDetails = justOneCard[0].detail + '\n\n' + markdown;
    finalDetails = useHtml ?
      '<div style="background-color:white;">' + marked(finalDetails) + '</div>' :
      finalDetails;
    justOneCard[0].detail = finalDetails;
    if (useHtml) {
      justOneCard[0].extension = {
        'com.epic.cdshooks.card.detail.content-type': 'text/html'
      };
    }
  }
  return justOneCard;
}

function formatEntry(ent) {
  let entDate = ent.date ?? 'no date available';
  let entString = ent.name + ' (' + entDate + '): ';
  entString = ent.value ? entString + ent.value : entString + 'No result available';
  return entString;
}