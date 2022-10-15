import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import {SHEET_PREFIX} from "./Config";
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

export class SheetGroup {
    prefix: SHEET_PREFIX;
    memberSheet: Sheet;
    scheduleSheet: Sheet;
    mailTemplateSheet: Sheet;
    logSheet: Sheet;
    config: Map<string,string>;

    constructor(prefix: SHEET_PREFIX) {
        this.prefix = prefix;
        this.memberSheet = this.getSheetByName('', 'member')!;
        this.scheduleSheet = this.getSheetByName(prefix, 'schedule')!;
        this.mailTemplateSheet = this.getSheetByName(prefix, 'mailTemplate')!;
        this.logSheet = this.getSheetByName(prefix, 'log')!;
        this.config = new Map<string,string>();
        spreadsheet.getSheetByName(prefix+'config')!.getRange("A:B").getValues()?.forEach(entry => {
            const key = entry[0] || "";
            const value = entry[1];
            this.config.set(key, value);
        });
    }

    getSheetByName(prefix: string, name: string){
        const sheet = spreadsheet.getSheetByName(prefix + name);
        if(! sheet){
            throw new Error("sheet not found:"+prefix+name);
        }
        return sheet;
    }

    getConfigValue(key: string){
        return this.config.get(key);
    }
}