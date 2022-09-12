// ActivityDefinition resources
import { CervicalCancerDecisionAids } from "./ActivityDefinition/CervicalCancerDecisionAids.js";
import { CervicalCancerManagementActivity } from "./ActivityDefinition/CervicalCancerManagementActivity.js";
import { CervicalCancerScreeningActivity } from "./ActivityDefinition/CervicalCancerScreeningActivity.js";
import { CommunicateErrors } from "./ActivityDefinition/CommunicateErrors.js";
import { DisplayCervicalCancerMedicalHistory } from "./ActivityDefinition/DisplayCervicalCancerMedicalHistory.js";

// Library resources
import { DashboardLibrary } from "./Library/DashboardLibrary.js";
import { ManagementLibrary } from "./Library/ManagementLibrary.js";
import { OrderSetLibrary } from "./Library/OrderSetLibrary.js";
import { ScreeningAverageRiskLibrary } from "./Library/ScreeningAverageRiskLibrary.js";
import { ScreeningDesExposureLibrary } from "./Library/ScreeningDesExposureLibrary.js";
import { ScreeningImmunocompromisedLibrary } from "./Library/ScreeningImmunocompromisedLibrary.js";
import { ScreeningLibrary } from "./Library/ScreeningLibrary.js";
import { ScreeningSymptomaticLibrary } from "./Library/ScreeningSymptomaticLibrary.js";

// PlanDefinition resources
import { CervicalCancerManagement } from "./PlanDefinition/CervicalCancerManagement.js";
import { CervicalCancerManagementActions } from "./PlanDefinition/CervicalCancerManagementActions.js";
import { CervicalCancerScreening } from "./PlanDefinition/CervicalCancerScreening.js";
import { CervicalCancerScreeningActions } from "./PlanDefinition/CervicalCancerScreeningActions.js";
import { 
  CervicalCancerScreeningAndManagementClinicalDecisionSupport 
} from "./PlanDefinition/CervicalCancerScreeningAndManagementClinicalDecisionSupport.js";

// Questionnaire resources
import { PertinentProcedureQuestionnaire } from "./Questionnaire/PertinentProcedureQuestionnaire.js";
import { PertinentConditionQuestionnaire } from "./Questionnaire/PertinentConditionQuestionnaire.js";
import { PertinentObservationQuestionnaire } from "./Questionnaire/PertinentObservationQuestionnaire.js";
import { PertinentVaccinationQuestionnaire } from "./Questionnaire/PertinentVaccinationQuestionnaire.js";
import { ScreeningAndManagementHistoryQuestionnaire } from "./Questionnaire/ScreeningAndManagementHistoryQuestionnaire.js";
import { VaccinationHistoryQuestionnaire } from "./Questionnaire/VaccinationHistoryQuestionnaire.js";

// ValueSet resources
import { ScreeningAndManagementTestType } from "./ValueSet/ScreeningAndManagementTestType.js";
import { CervicalCytologyResult } from "./ValueSet/CervicalCytologyResult.js";
import { HpvTestResult } from "./ValueSet/HpvTestResult.js";
import { CervicalHistologyResult } from "./ValueSet/CervicalHistologyResult.js";
import { PertinentProcedureShortList } from "./ValueSet/PertinentProcedureShortList.js";
import { PertinentConditionShortList } from "./ValueSet/PertinentConditionShortList.js";
import { PertinentObservationShortList } from "./ValueSet/PertinentObservationShortList.js";
import { QualifierValuesShortList } from "./ValueSet/QualifierValuesShortList.js";
import { PertinentVaccinationShortList } from "./ValueSet/PertinentVaccinationShortList.js";

export const cdsResources = [
  CervicalCancerDecisionAids,
  CervicalCancerManagementActivity,
  CervicalCancerScreeningActivity,
  CommunicateErrors,
  DisplayCervicalCancerMedicalHistory,
  DashboardLibrary,
  ManagementLibrary,
  OrderSetLibrary,
  ScreeningAverageRiskLibrary,
  ScreeningDesExposureLibrary,
  ScreeningImmunocompromisedLibrary,
  ScreeningLibrary,
  ScreeningSymptomaticLibrary,
  CervicalCancerManagement,
  CervicalCancerManagementActions,
  CervicalCancerScreening,
  CervicalCancerScreeningActions,
  CervicalCancerScreeningAndManagementClinicalDecisionSupport,
  PertinentProcedureQuestionnaire,
  PertinentConditionQuestionnaire,
  PertinentObservationQuestionnaire,
  PertinentVaccinationQuestionnaire,
  ScreeningAndManagementHistoryQuestionnaire,
  VaccinationHistoryQuestionnaire,
  ScreeningAndManagementTestType,
  CervicalCytologyResult,
  HpvTestResult,
  CervicalHistologyResult,
  PertinentProcedureShortList,
  PertinentConditionShortList,
  PertinentObservationShortList,
  PertinentVaccinationShortList,
  QualifierValuesShortList
];

export { resourceConverter } from './resourceConverter.js';