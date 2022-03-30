import {Config} from './Config';

export class SpreadsheetModule {
  static createPrefilledUrl(formUrl: string, ayear: string, studyAt: string, reportNum: string) {
    return `${formUrl}?usp=pp_url&entry.${Config.ayearEntryId}=${ayear}&entry.${Config.studyAtEntryId}=${encodeURIComponent(studyAt)}&entry.${Config.reportNumEntryId}=${encodeURIComponent(reportNum)}`;
  }
}
