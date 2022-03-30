import {Config} from './Config';

export class ActiveSpreadsheet {
  static spreadsheet = SpreadsheetApp.openById(Config.spreadsheetId);
  static memberSheet = ActiveSpreadsheet.spreadsheet.getSheetByName("member");
  static scheduleSheet = ActiveSpreadsheet.spreadsheet.getSheetByName("schedule");
  static logSheet = ActiveSpreadsheet.spreadsheet.getSheetByName("log");
}
