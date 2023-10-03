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
  });

  describe('parse procedure data', () => {
    it('should include Cervix Excision procedure', function () {
      translateResponse(customApiResponse, patientData);
      expect(patientData.length).to.be.greaterThan(2);

      const procedures = patientData.filter(pd => pd.resourceType === 'Procedure');
      expect(procedures.length).to.be.greaterThan(1);
      expect(procedures.some(p => p.code.coding.some(coding => coding.code === '120038005'))).to.be.true;
    });
  });

  describe('parse excision results', () => {
    it('should ignore excision results that do not show AIS or histologic cancer', function () {
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports.length).to.equal(1);
      expect(diagnosticReports.some(p => p.code.coding.some(coding => coding.code === '65753-6'))).to.be.false;
    });

    it('should map an AIS excision result to a biopsy', function () {
      customApiResponse.Order[0].ExcisionResults =
        [
          {
            ID: 'ECT.14006.6',
            Value: 'AIS'
          }
        ];
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports.length).to.equal(1);
      expect(diagnosticReports.some(p => p.code.coding.some(coding => coding.code === '65753-6'))).to.be.true;
      expect(diagnosticReports.some(p => p.conclusionCode.some(cC => cC.coding.some(coding => coding.code === '254890008')))).to.be.true;
    });

    it('should map a histologic cancer excision result to a biopsy', function () {
      customApiResponse.Order[0].ExcisionResults =
        [
          {
            ID: 'ECT.14006.11',
            Value: 'Adenocarcinoma'
          }
        ];
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports.length).to.equal(1);
      expect(diagnosticReports.some(p => p.code.coding.some(coding => coding.code === '65753-6'))).to.be.true;
      expect(diagnosticReports.some(p => p.conclusionCode.some(cC => cC.coding.some(coding => coding.code === '363354003')))).to.be.true;
    });
  });

  describe('translateEpisodeOfCare', () => {
    it('should translate epic code to snomed code', () => {
      translateResponse(customApiResponse, patientData);

      const episodeOfCare = patientData.filter(pd => pd.resourceType === 'EpisodeOfCare');
      expect(episodeOfCare).to.not.be.empty;
      expect(episodeOfCare.some(p => p.type.some(type => type.coding.some(coding => coding.code === '424525001' && coding.system === 'http://snomed.info/sct')))).to.be.true;
      expect(episodeOfCare.some(p => p.type.some(type => type.text === 'PREGNANCY'))).to.be.true;
    });

    it('should skip if resource does not have EpisodeOfCare', () => {
      let patientDataWithoutEpisodeOfCare = patientData.filter(pd => pd.resourceType != 'EpisodeOfCare');
      translateResponse(customApiResponse, patientDataWithoutEpisodeOfCare);

      const episodeOfCare = patientDataWithoutEpisodeOfCare.filter(pd => pd.resourceType === 'EpisodeOfCare');
      expect(episodeOfCare).to.be.empty;
    });
  });
});
