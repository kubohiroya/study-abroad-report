import {updateDelayStatus} from './updateDelayStatus';

export function onOpen() {
  const menu = SpreadsheetApp.getUi().createMenu("更新");
  menu.addSubMenu(SpreadsheetApp.getUi().createMenu("schedule")
    .addItem("O列の開始日時・P列の終了日時を更新", "updateScheduleCellValues"))
  menu.addSubMenu(SpreadsheetApp.getUi().createMenu("学生ごとの提出状況")
    .addItem("J:O列の遅延状況", "updateDelayStatus"))
  menu.addToUi();

  updateDelayStatus();
}
