import {Config} from "./Config";
import {ScheduleSheetModule} from "./ScheduleSheetModule";
import {SheetGroup} from "./SheetGroup";

export const updateScheduleCellValues = () => {
    Config.PREFIXES.forEach(prefix=>{
        const sheetGroup = new SheetGroup(prefix);
        new ScheduleSheetModule(sheetGroup).updateScheduleCellValues();
    })
}