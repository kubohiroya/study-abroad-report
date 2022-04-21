
export class ActiveSpreadsheet {
  static spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  static sheets = new Map(ActiveSpreadsheet.spreadsheet.getSheets().map(sheet => [sheet.getName(), sheet]));
  static memberSheet = ActiveSpreadsheet.sheets.get("member");
  static scheduleSheet = ActiveSpreadsheet.sheets.get("schedule");
  static mailTemplateSheet = ActiveSpreadsheet.sheets.get("mailTemplate");
  static logSheet = ActiveSpreadsheet.sheets.get("log");
  static config = new Map();
  static {
    ActiveSpreadsheet.sheets.get("config")?.getRange("A:B").getValues()?.forEach(entry => {
      const key = entry[0] || "";
      const value = entry[1];
      ActiveSpreadsheet.config.set(key, value);
    })
  }
}
