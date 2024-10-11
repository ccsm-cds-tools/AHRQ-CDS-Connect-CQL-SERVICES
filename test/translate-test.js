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

  describe('create diagnostic report', () => {
    it('should create DiagnosticReport from CustomAPI response', () => {
      expect(patientData.filter(pd => pd.resourceType === 'DiagnosticReport').length).to.be.equal(0);
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports.length).to.equal(1);

      const diagnosticReport = diagnosticReports[0];
      const order = customApiResponse.Order[0];

      expect(diagnosticReport.id).to.equal(order.OrderId);
      expect(diagnosticReport.status).to.equal('final');
      expect(diagnosticReport.effectiveDateTime).to.equal(order.ResultDate);
      expect(diagnosticReport.code.coding.length).to.equal(1);
    });

    it('should not create DiagnosticReport if no mapping from CustomAPI response', () => {
      customApiResponse.Order[0].PapResults = [];
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');
      expect(diagnosticReports).to.be.empty;
    });

    it('should create and AGC-FN DiagnosticReport from CustomAPI response', () => {
      expect(patientData.filter(pd => pd.resourceType === 'DiagnosticReport').length).to.be.equal(0);

      customApiResponse.Order[0].FindingType =
      {
        'ID': 'ECT.14001.1',
        'Value': 'Pap Smear'
      };

      customApiResponse.Order[0].PapResults =
      [
        {
          ID: 'ECT.14009.10001',
          Value: 'AGC-Endocervical'
        }
      ];

      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports.length).to.equal(1);

      const diagnosticReport = diagnosticReports[0];
      const order = customApiResponse.Order[0];
      console.log(JSON.stringify(diagnosticReport, null, 2));

      expect(diagnosticReport.id).to.equal(order.OrderId);
      expect(diagnosticReport.status).to.equal('final');
      expect(diagnosticReport.effectiveDateTime).to.equal(order.ResultDate);
      expect(diagnosticReport.code.coding.length).to.equal(1);
    });


  });

  describe('parse procedure data', () => {
    it('should include Cervix Excision procedure', function () {
      translateResponse(customApiResponse, patientData);
      const procedures = patientData.filter(pd => pd.resourceType === 'Procedure');

      expect(procedures).to.not.be.empty;
      expect(procedures.some(p => p.code.coding.some(coding => coding.code === '120038005'))).to.be.true;
    });
  });

  describe('parse excision results', () => {
    it('should ignore excision results that do not show AIS or histologic cancer', function () {
      translateResponse(customApiResponse, patientData);
      const diagnosticReports = patientData.filter(pd => pd.resourceType === 'DiagnosticReport');

      expect(diagnosticReports).to.not.be.empty;
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

      expect(diagnosticReports).to.not.be.empty;
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

      expect(diagnosticReports).to.not.be.empty;
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
      let patientDataWithoutEpisodeOfCare = patientData.filter(pd => pd.resourceType !== 'EpisodeOfCare');
      translateResponse(customApiResponse, patientDataWithoutEpisodeOfCare);

      const episodeOfCare = patientDataWithoutEpisodeOfCare.filter(pd => pd.resourceType === 'EpisodeOfCare');
      expect(episodeOfCare).to.be.empty;
    });
  });
});
