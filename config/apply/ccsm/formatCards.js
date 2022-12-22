import { simpleResolver } from 'encender';

export function formatCards(actions, otherResources, cards=[]) {
  // For each action in the array
  for (const action of actions) {
    console.log('action: ', action);
    // If action.resource.reference contains a CommunicationRequest
    if (action.resource?.reference && action.resource?.reference?.includes('CommunicationRequest')) {
      // Make an information card with that action (pass into extractInformation)
      cards.push(extractInformation(action, otherResources));
    // If action.selection behavior exists
    } else if (action.selectionBehavior) {
      // Make a suggestion card with the children actions as suggestions (pass children into extractSuggetsions)
      // If child action is a Service Request, add a suggestion with an action with a resource
      cards.push(extractSuggestions(action, otherResources));
    // Else if sub-action exists, call extractCard on the sub-action
    } else if (action.action) {
      cards = formatCards(action.action, otherResources, cards);
    }
  }
  return cards;
}

function extractInformation(action, otherResources) {
  let resolver = simpleResolver([...otherResources], true);
  let sources = action?.documentation ? getSources(action.documentation) : [{label:'no source listed'}];
  let card = {
    summary: action.title,
    uuid: action.id, // Cards must have a uuid to render properly
    indicator: getIndicator(action.priority),
    source: sources[0],
    links: sources.slice(1)?.map(s => ({...s,type:'absolute'})),
    // Communication Request payload makes up the main contents of the card
    detail: resolver(action.resource.reference)[0]?.payload[0].contentString ?? null
  }; 
  return card;
}

function extractSuggestions(action, otherResources) {
  let resolver = simpleResolver([...otherResources], true);
  let sources = action?.documentation ? getSources(action.documentation) : [{label:'no source listed'}];
  let suggestions = [];
  for (const subaction of action.action) {
    if (subaction.resource?.reference?.includes('ServiceRequest')) {
      let rsrc = resolver(subaction.resource.reference)[0] ?? {};
      // Add necessary fields to Service Request resource
      rsrc.status = 'draft';
      if (rsrc?.code?.display) {
        rsrc.code.text = rsrc.code.display;
        delete rsrc.code.display;
      }
      if (!rsrc?.category) {
        rsrc.category = [
          {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '108252007',
                display: 'Laboratory procedure'
              }
            ]
          }
        ];
      }
      let suggestion = {
        label: subaction.title,
        uuid: subaction.id,
        actions: [{
          type: subaction.type ?? 'create',
          description: subaction.description ?? subaction.title,
          resourceId: subaction.resource?.reference ?? null,
          resource: rsrc ?? null
        }]
      };
      suggestions.push(suggestion);
    }
  }

  let card = {
    summary: action.title,
    detail: action.description,
    uuid: action.id, // Cards must have a uuid to render properly
    indicator: getIndicator(action.priority),
    source: sources[0],
    selectionBehavior: getSelectionBehavior(action.selectionBehavior),
    links: sources.slice(1)?.map(s => ({...s,type:'absolute'})),
    // Service Requests in the subaction make up the suggestions
    suggestions: suggestions
  };   
  return card;  
}

function getIndicator(priority) {
  switch (priority) {
  case 'routine': return 'info';
  case 'urgent': return 'warning';
  case 'asap': return 'critical';
  case 'stat': return 'critical';
  default: return 'info';
  }
}

function getSources(relatedArtifacts) {
  let sources = [];
  for (const related of relatedArtifacts) {
    if (['documentation','justification','citation','derived-from'].includes(related.type)) {
      sources.push({
        label: related.label,
        url: related.url
      });
    }
  }
  return sources;
}

function getSelectionBehavior(sb) {
  return 'any';
}