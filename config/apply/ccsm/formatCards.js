import { simpleResolver } from 'encender';

/**
 * Takes actions produced from the FHIR $apply operation and converts them to CDS Hooks cards
 * @param {Object[]} actions An array of actions produced by the $apply operation
 * @param {Object[]} otherResources An array of other resources produced by the $apply operation
 * @param {Object[]} cards Existing CDS Hooks cards we may want to add to
 * @returns {Object[]} An array of CDS Hooks cards
 */
export function formatCards(actions, otherResources, cards=[]) {
  // For each action in the array
  for (const action of actions) {
    // If action.resource.reference contains a CommunicationRequest, convert it to an 
    // information card.
    if (action.resource?.reference && action.resource?.reference?.includes('CommunicationRequest')) {
      // Make an information card with that action (pass into extractInformation)
      cards.push(extractInformation(action, otherResources));
    // If action.selection behavior exists, convert it to a suggestion card
    } else if (action.selectionBehavior) {
      // Make a suggestion card with the children actions as suggestions (pass children into extractSuggetsions)
      // If child action is a Service Request, add a suggestion with an action with a resource
      cards.push(extractSuggestions(action, otherResources));
    // Else if sub-action exists, call extractCard on the sub-action
    } else if (action.action) {
      cards = formatCards(action.action, otherResources, cards);
    }
    // Else, do nothing
  }
  return cards;
}

/**
 * Converts an action referencing a CommunicationRequest to a CDS Hooks information card
 * @param {Object} action An applied action that references a CommunicationRequest 
 * @param {Object[]} otherResources An array of other resources produced by the $apply operation
 * @returns {Object} A CDS Hooks information card
 */
function extractInformation(action, otherResources) {
  // Create a resolver so we can find the referenced CommunicationRequest
  let resolver = simpleResolver([...otherResources], true);
  // Extract any sources
  let sources = action?.documentation ? getSources(action.documentation) : [{label:'no source listed'}];
  // Check the payload for JSON that may need to be deserialized
  const payload = resolver(action.resource.reference)[0]?.payload;//[0]?.contentString;
  let contentString = payload.length > 0 ? payload[0].contentString : null ?? '';
  // Create the information card
  let card = {
    summary: action.title,
    uuid: action.id, // Cards must have a uuid to render properly
    indicator: getIndicator(action.priority),
    source: sources[0],
    links: sources.slice(1)?.map(s => ({...s,type:'absolute'})),
    // CommunicationRequest payload makes up the main contents of the card
    detail: contentString
  }; 
  return card;
}

/**
 * Converts an action containing a selectionBehavior into a CDS Hooks suggestion card
 * @param {Object} action An applied action that contains a selectionBehavior element
 * @param {Object[]} otherResources An array of other resources produced by the $apply operation
 * @returns A CDS Hooks suggestion card
 */
function extractSuggestions(action, otherResources) {
  // Create a resolver so we can find any referenced resources
  let resolver = simpleResolver([...otherResources], true);
  // Extract any sources
  let sources = [];
  if (action?.documentation) { sources.push(getSources(action.documentation)); }
  // Initialize an emptry suggestion array
  let suggestions = [];
  // Convert actions to suggestions
  for (const subaction of action.action) {
    if (subaction.resource?.reference?.includes('ServiceRequest')) {
      if (subaction?.documentation) { sources.push(getSources(subaction.documentation)); }
      // Resolve the referenced ServiceRequest
      let srvRqt = resolver(subaction.resource.reference)[0] ?? {};
      // Add necessary fields to Service Request resource
      srvRqt.status = 'draft'; // status should always be draft
      // move code.display to code.text
      if (srvRqt?.code?.display) {
        srvRqt.code.text = srvRqt.code.display;
        delete srvRqt.code.display;
      }
      // define a category to add
      let category = [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/medicationrequest-category',
              code: 'outpatient',
              display: 'Outpatient'
            }
          ]
        }
      ];
      // Reformat the final ServiceRequest
      srvRqt = {
        resourceType: srvRqt.resourceType,
        status: srvRqt.status,
        intent: 'proposal',
        category: category,
        code: {
          coding: [
            {
              code: srvRqt.code.coding[0].code,
              system: srvRqt.code.coding[0].system
            }
          ],
          text: srvRqt.code.text
        },
        subject: srvRqt.subject
      };
      // Wrap the ServiceRequest in a suggestion
      let suggestion = {
        label: subaction.title,
        uuid: subaction.id,
        actions: [{
          type: subaction.type ?? 'create',
          description: subaction.description ?? subaction.title,
          resource: srvRqt ?? null
        }]
      };
      // Push the suggestion onto the suggestions array
      suggestions.push(suggestion);
    }
  }
  // Format the card using the action and suggestions array
  let source = sources.length > 0 ? sources[0] : {label: 'No source listed'};
  let card = {
    summary: action.title,
    detail: action.description,
    uuid: action.id, // Cards must have a uuid to render properly
    indicator: getIndicator(action.priority),
    source: source.length > 0 ? source[0] : source,
    selectionBehavior: getSelectionBehavior(action.selectionBehavior),
    links: sources.map(s => ({...s[0],type:'absolute'}))[0],
    suggestions: suggestions
  };   
  return card;
}

/**
 * Maps a PlanDefintion action priority to CDS Hooks indicator.
 * @param {String} priority 
 * @returns {String} indicator
 */
function getIndicator(priority) {
  switch (priority) {
  case 'routine': return 'info';
  case 'urgent': return 'warning';
  case 'asap': return 'critical';
  case 'stat': return 'critical';
  default: return 'info';
  }
}

/**
 * Map relatedArtifact elements to sources.
 * @param {Object[]} relatedArtifacts Array of relatedArtifact elements
 * @returns {Object[]} Array of sources
 */
function getSources(relatedArtifacts) {
  let sources = [];
  for (const related of relatedArtifacts) {
    // Only consider these types of relatedArtifacts
    if (['documentation','justification','citation','derived-from'].includes(related.type)) {
      sources.push({
        label: related.display,
        url: related.url
      });
    }
  }
  return sources;
}

/**
 * Maps the selectionBehavior element in a PlanDefinition group action to CDS Hooks.
 * @param {*} _sb Selection behavior in group element
 * @returns {String} Currently hardcoded to 'any'
 */
function getSelectionBehavior(_sb) {
  return 'any';
}