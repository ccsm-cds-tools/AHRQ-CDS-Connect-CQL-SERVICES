import { expect } from 'chai';
import { translateResponse } from '../config/apply/ccsm/translate.js';
import fs from 'fs';

describe('translateResponse', () => {
  let patientData, customApiResponse;
  const patientDataContent = fs.readFileSync('./test/fixtures/translate/patientData.json', 'utf-8');
  const resultContent = fs.readFileSync('./test/fixtures/translate/results.json', 'utf-8');

  beforeEach(() => {
    patientData = JSON.parse(patientDataContent).patientData;
    customApiResponse = JSON.parse(resultContent);
    translateResponse(customApiResponse, patientData);
  });

  describe('parse procedure data', () => {
    it('should include Cervix Excision procedure', function () {
      expect(patientData.length).to.be.greaterThan(2);

      const procedures = patientData.filter(pd => pd.resourceType === 'Procedure');
      expect(procedures.length).to.be.greaterThan(0);
      expect(procedures.some(p => p.code.coding.some(coding => coding.code === '120038005'))).to.be.true;
    });
  });
});
