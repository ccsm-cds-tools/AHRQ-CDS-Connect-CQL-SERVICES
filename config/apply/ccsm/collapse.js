/* eslint-disable no-console */
import { marked } from 'marked';
import { getSources } from './formatCards.js';
import pug from 'pug';
import dayjs from 'dayjs';

/**
 *
 * @param {*} cards
 * @returns
 */
export function collapseIntoOne(cards, useHtml=false) {
  const summary = 'Cervical Cancer Decision Support';
  let justOneCard = [{}];
  let group = '';
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
    // Generate the markdown details
    // The first item of the recommendation details array is the 'main' part of the recommendation; display in bold
    let markdown =
      '# ' + recommendation + '\n\n' +
      '## ' + recommendationDetails[0] + '\n\n' +
      recommendationDetails.slice(1).join('\n\n') + '\n\n\n';
    group = '**Reference**: ' + recommendationGroup + '\n';

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

    let markdown = 
      (
        diagnosticReports.length > 0 ||
        conditions.length > 0 ||
        observations.length > 0 ||
        procedures.length > 0 ||
        medications.length > 0 ||
        encounters.length > 0 ||
        immunizations.length > 0 ||
        episodeOfCares.length > 0
      ) ? '' : '### Patient History\n\nNo relevant patient history';
    
    if (episodeOfCares.length > 0) {
      markdown = markdown + '\n\n' +
        '### Pregnancy Episode' + '\n\n' +
        formatEntry(episodeOfCares);
    }
    if (conditions.length > 0) {
      markdown = markdown + '\n\n' +
        '### Diagnoses' + '\n\n' +
        formatEntry(conditions);
    }
    if (observations.length > 0) {
      markdown = markdown + '\n\n' +
        '### Observations' + '\n\n' +
        formatEntry(observations);
    }
    if (medications.length > 0) {
      markdown = markdown + '\n\n' +
        '### Medications' + '\n\n' +
        formatEntry(medications);
    }
    if (diagnosticReports.length > 0) {
      markdown = markdown  + '\n\n' + 
        '### Tests & Labs' + '\n\n' +
        formatEntry(diagnosticReports);
    }
    if (procedures.length > 0) {
      markdown = markdown + '\n\n' +
        '### Procedures' + '\n\n' +
        formatEntry(procedures);
    }
    if (immunizations.length > 0) {
      markdown = markdown + '\n\n' +
        '### Immunizations' + '\n\n' +
        formatEntry(immunizations);
    }
    
    let finalDetails = justOneCard[0].detail + '\n\n' + markdown + '\n\n' + group;
    finalDetails = useHtml ?
      '<div style="background-color:white;padding:1em">' + marked(finalDetails) + '</div>' :
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

const table = pug.compile(
  'table(style={"border-spacing":"0","margin-bottom":"10px","margin-top":"5px"})\n'+
  '\teach val in history\n' +
  '\t\ttr\n'+
  '\t\t\ttd(style={"border-bottom":"1px solid #eee","padding":"5px 20px 5px 0","width":"8em"}) #{val.date ? dayjs(val.date).format("MM/DD/YYYY") : "Date Unknown"}\n' +
  '\t\t\ttd(style={"border-bottom":"1px solid #eee","padding":"5px 20px 5px 0","width":"14em"}) #{val.name}\n' +
  '\t\t\ttd(style={"border-bottom":"1px solid #eee","padding":"5px 20px 5px 0"}) #{val.value || "n/a"}'
);
  
function formatEntry(ent) {
  return table({history:ent,dayjs:dayjs});
}
