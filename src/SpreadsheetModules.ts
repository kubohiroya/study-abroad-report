import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
export class SpreadsheetModule {

  static getConfigValues(key: string): string[]{
    return SpreadsheetApp.getActiveSpreadsheet().getSheets().filter(sheet=>sheet.getName().endsWith("config")).map(sheet => {
      return (sheet.getDataRange().getValues() as any[][])
          .filter(row => row[0] === key).map<string>(row => row[1])[0];
    });
  }

}

export function getConfigSheet(key: string, value: string): Sheet|undefined{
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().find(sheet=>sheet.getName().endsWith("config") && (sheet.getDataRange().getValues() as any[][]).some(row => row[0] === key && row[1] === value))
}
