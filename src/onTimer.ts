import {SendMailModule} from './SendMailModule';
import {SheetGroup} from "./SheetGroup";
import {Config} from "./Config";

export function onTimer() { // wake up every 1 hour
  const date = new Date();
  Config.PREFIXES.forEach(prefix=>{
    const sheetGroup = new SheetGroup(prefix);
    SendMailModule.sendCustomizedMailsByDate(sheetGroup, date);
  })
}
