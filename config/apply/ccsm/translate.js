import { ScreeningAndManagementTestType } from 'ccsm-cds-with-tests/fhir/ValueSet/ScreeningAndManagementTestType.js';
import { CervicalCytologyResult } from 'ccsm-cds-with-tests/fhir/ValueSet/CervicalCytologyResult.js';
import { HpvTestResult } from 'ccsm-cds-with-tests/fhir/ValueSet/HpvTestResult.js';
import { CervicalHistologyResult } from 'ccsm-cds-with-tests/fhir/ValueSet/CervicalHistologyResult.js';

let standardTestTypeCodes = reformatValueSet(ScreeningAndManagementTestType);
let standardCytologyCodes = reformatValueSet(CervicalCytologyResult);
let standardHpvCodes = reformatValueSet(HpvTestResult);
let standardHistologyCodes = reformatValueSet(CervicalHistologyResult);

/**
 * Take a FHIR ValueSet resource and reformat to return just the codings.
 * @param {Object} ValueSet - A FHIR ValueSet resource 
 * @returns {Object} - An object containing just the codings that appear in the value set
 */
function reformatValueSet(ValueSet) {
  const system = ValueSet.compose.include[0].system;
  const reformatted = ValueSet.compose.include[0].concept.reduce((acc, cv) => {
    return {
      ...acc,
      [cv.display]: {
        system,
        code: cv.code,
        display: cv.designation[0].value
      }
    };
  },{});
  return reformatted;
}

// ## PapResults
//
// When the finding type is `Pap Smear` the `PapResults` may be populated.
//
// >Can be null.
//
// Maps to Category Values in `ECT, 14009 - CCS - TRANSCRIBED PAP RESULTS (MULTI)`
//
// - ECT.14009.1 - NILM
// - ECT.14009.2 - ASC-US
// - ECT.14009.3 - ASC-H
// - ECT.14009.4 - LSIL
// - ECT.14009.5 - HSIL
// - ECT.14009.6 - Squamous Cell Carcinoma
// - ECT.14009.8 - AGC-FN
// - ECT.14009.9 - AIS
// - ECT.14009.10 - Adenocarcinoma
// - ECT.14009.99 - Other
// - ECT.14009.10000 - LSIL cannot r/o HSIL
// - ECT.14009.10001 - AGC-Endocervical
// - ECT.14009.10002 - AGC-Endometrial
// - ECT.14009.10003 - AGC-NOS
const customCytologyCodes = {
  'ECT.14009.1': {
    Value: 'NILM',
    mapping: 'NILM'
  },
  'ECT.14009.2': {
    Value: 'ASC-US',
    mapping: 'ASC-US'
  },
  'ECT.14009.3': {
    Value: 'ASC-H',
    mapping: 'ASC-H'
  },
  'ECT.14009.4': {
    Value: 'LSIL',
    mapping: 'LSIL'
  },
  'ECT.14009.5': {
    Value: 'HSIL',
    mapping: 'HSIL'
  },
  'ECT.14009.6': {
    Value: 'Squamous Cell Carcinoma',
    mapping: 'SCC'
  },
  'ECT.14009.8': {
    Value: 'AGC-FN',
    mapping: 'AGC' // NOTE: What should this map to?
  },
  'ECT.14009.9': {
    Value: 'AIS',
    mapping: 'AIS'
  },
  'ECT.14009.10': {
    Value: 'Adenocarcinoma',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14009.99': {
    Value: 'Other',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14009.10000': {
    Value: 'LSIL cannot r/o HSIL',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14009.10001': {
    Value: 'AGC-Endocervical',
    mapping: 'AGC' // NOTE: What should this map to?
  },
  'ECT.14009.10002': {
    Value: 'AGC-Endometrial',
    mapping: 'AGC' // NOTE: What should this map to?
  },
  'ECT.14009.10003': {
    Value: 'AGC-NOS',
    mapping: 'AGC' // NOTE: What should this map to?
  }
};

// ## HPVResults
//
// Maps to category values in `ECT, 14003 - CCS - TRANSCRIBED HPV RESULTS`
//
// - ECT.14003.1 - HRHPV -
// - ECT.14003.2 - HRHPV +
// - ECT.14003.5 - HRHPV 16 -
// - ECT.14003.6 - HRHPV 16 +
// - ECT.14003.7 - HRHPV 18 -
// - ECT.14003.8 - HRHPV 18 +
// - ECT.14003.99 - N/A
const customHpvCodes = {
  'ECT.14003.1': {
    Value: 'HRHPV -',
    mapping: 'Negative'
  },
  'ECT.14003.2': {
    Value: 'HRHPV +',
    mapping: 'Positive (Not Type 16/18)'
  },
  'ECT.14003.5': {
    Value: 'HRHPV 16 -',
    mapping: null
  },
  'ECT.14003.6': {
    Value: 'HRHPV 16 +',
    mapping: 'Positive (Type 16)'
  },
  'ECT.14003.7': {
    Value: 'HRHPV 18 -',
    mapping: null
  },
  'ECT.14003.8': {
    Value: 'HRHPV 18 +',
    mapping: 'Positive (Type 18)'
  },
  'ECT.14003.99': {
    Value: 'N/A',
    mapping: null
  }
};

// ## ColposcopyResults
//
// >Can be null.
//
// Maps to category values in `ECT, 14005 - CCS - TRANSCRIBED COLPOSCOPY RESULTS`
//
// - ECT.14005.1 - Normal
// - ECT.14005.2 - Unsatisfactory
// - ECT.14005.3 - CIN1
// - ECT.14005.4 - CIN2
// - ECT.14005.5 - CIN3
// - ECT.14005.6 - AIS
// - ECT.14005.7 - ECC Not Done
// - ECT.14005.8 - ECC Negative
// - ECT.14005.9 - ECC Positive
// - ECT.14005.10 - Squamous Cell Carcinoma
// - ECT.14005.11 - Adenocarcinoma
// - ECT.14005.99 - Other
const customHistologyCodes = {
  'ECT.14005.1': {
    Value: 'Normal',
    mapping: 'Normal'
  },
  'ECT.14005.2': {
    Value: 'Unsatisfactory',
    mapping: null
  },
  'ECT.14005.3': {
    Value: 'CIN1',
    mapping: 'CIN 1'
  },
  'ECT.14005.4': {
    Value: 'CIN2',
    mapping: 'CIN 2'
  },
  'ECT.14005.5': {
    Value: 'CIN3',
    mapping: 'CIN 3'
  },
  'ECT.14005.6': {
    Value: 'AIS',
    mapping: 'AIS'
  },
  'ECT.14005.7': {
    Value: 'ECC Not Done',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14005.8': {
    Value: 'ECC Negative',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14005.9': {
    Value: 'ECC Positive',
    mapping: null // NOTE: What should this map to?
  },
  'ECT.14005.10': {
    Value: 'Squamous Cell Carcinoma',
    mapping: 'Cancer' // NOTE: What should this map to?
  },
  'ECT.14005.11': {
    Value: 'Adenocarcinoma',
    mapping: 'Cancer' // NOTE: What should this map to?
  },
  'ECT.14005.99': {
    Value: 'Other',
    mapping: null // NOTE: What should this map to?
  }
};

/**
 * Translate the response from the custom API into FHIR and updated the array of patient data
 * @param {Object[]} customApiResponse - Not in FHIR
 * @param {Object[]} patientData - Array of FHIR resources
 * @returns {Object[]} - patientData updated with the results from the custom API response
 */
export function translateResponse(customApiResponse, patientData) {
  // Translate the orders from the custom API response into FHIR
  const orders = customApiResponse.Order ?? [];
  orders.forEach(order => {
    // Unpack the parts of the order we care about
    const {
      OrderId: orderId,
      FindingType: findingType,
      PapResults: papResults,
      HPVResults: hpvResults,
      ColposcopyResults: colposcopyResults
    } = order;

    // Find the DiagnosticReport referenced by this order
    const diagnosticReportIndex = patientData.findIndex(pd => {
      return (
        pd.resourceType === 'DiagnosticReport' && 
        pd.identifier.filter(id => id.value === orderId).length > 0
      );
    });

    let codings = [];
    if (papResults.length > 0) {
      codings.push(standardTestTypeCodes['Cervical Cytology (Pap)']);
    }
    if (hpvResults.length > 0) {
      codings.push(standardTestTypeCodes['HPV']);
    }
    if (colposcopyResults.length > 0) {
      codings.push(standardTestTypeCodes['Cervical Histology']);
    }

    let conclusionCodes = [];

    // Map the custom pap results to our standard codes
    conclusionCodes = mapResults(papResults, customCytologyCodes, standardCytologyCodes, conclusionCodes);

    // Map the custom HPV results to our standard codes
    conclusionCodes = mapResults(hpvResults, customHpvCodes, standardHpvCodes, conclusionCodes);

    // Map the custom histology results to our standard codes
    conclusionCodes = mapResults(colposcopyResults, customHistologyCodes, standardHistologyCodes, conclusionCodes);

    if (diagnosticReportIndex !== -1) {
      console.log('Found the diagnostic report reference');
      // Update the DiagnosticReport in patientData with the results from the custom API
      patientData[diagnosticReportIndex] = {
        ...patientData[diagnosticReportIndex],
        code: {
          coding: [
            ...patientData[diagnosticReportIndex].code.coding,
            ...codings
          ]
        },
        conclusionCode: conclusionCodes
      };

      console.log('diagnostic report: ', patientData[diagnosticReportIndex]);
      console.log('dr conclusion codes: ', patientData[diagnosticReportIndex].conclusionCode);
      patientData[diagnosticReportIndex].conclusionCode.forEach(drcc => {
        console.log('dr mapped conconclusion code: ', drcc.coding[0], drcc.text);
      });
    }
  });

  return patientData;
}

/**
 * August an array of conclusion codes with mapped results from the custom API.
 * @param {Object[]} results - Results from the custom API
 * @param {Object} customCodes - Mapping from custom codes to standard
 * @param {Object} standardCodes - Standard codes keyed by their shorthand name
 * @param {Object[]} conclusionCodes - Input array of conclusion codes
 * @returns {Object[]} - Conclusion codes augmented with mapped results
 */
function mapResults(results, customCodes, standardCodes, conclusionCodes) {
  results.forEach(r => {
    const mappedKey = Object.entries(customCodes)
      .filter(cc => cc[0] === r.ID && cc[1].Value === r.Value)
      .map(cc => cc[1].mapping)[0];
    if (mappedKey) {
      const mappedCode = standardCodes[mappedKey];
      conclusionCodes.push({
        coding: [mappedCode],
        text: mappedKey
      });
    }
  });

  return conclusionCodes;
}