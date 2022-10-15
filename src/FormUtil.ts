import {SheetGroup} from "./SheetGroup";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export function createPrefilledUrl(sheetGroup: SheetGroup, formUrl: string, ayear: string, studyAt: string, reportNum: string) {
    return `${formUrl}?usp=pp_url&`+
        `entry.${sheetGroup.config.get("ayearEntryId")}=${ayear}&`+
        `entry.${sheetGroup.config.get("studyAtEntryId")}=${encodeURIComponent(studyAt)}&`+
        `entry.${sheetGroup.config.get("reportNumEntryId")}=${encodeURIComponent(reportNum)}`;
}

export function parsePrefilledUrl(url: string): string[] {
    const result = url.match(/entry\.(\d+)/g)!.map(m=>m.substring('entry.'.length));
    return [result[0], result[1], result[2]];
}

export function getPrefixByFormEditUrl(sheet: Sheet): string|undefined {
    if(! sheet){
        throw new Error();
    }
    const sheetName = sheet.getSheetName();
    return sheetName.substring(0, sheetName.length-"config".length);
}
