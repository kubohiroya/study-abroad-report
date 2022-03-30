export function onOpen() {
  SpreadsheetApp.getUi().createMenu("更新")
    .addSubMenu(SpreadsheetApp.getUi().createMenu("schedule").addItem("O列の開始日時・P列の終了日時を更新", "updateScheduleCellValues"))
    .addToUi();
}
