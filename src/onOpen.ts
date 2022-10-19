import {updateDelayStatus} from './updateDelayStatus';
import {updateTriggers} from "./updateTriggers";
import {updateScheduleCellValues} from "./updateScheduleCellValues";
import {parsePrefilledUrl} from "./FormUtil";
import Ui = GoogleAppsScript.Base.Ui;

export function onOpen() {

  const menu = SpreadsheetApp.getUi().createMenu("設定");

  menu.addSubMenu(SpreadsheetApp.getUi().createMenu("「config」シート")
      .addItem("初期設定", "updateConfigSheet")
  );

  menu.addSubMenu(SpreadsheetApp.getUi().createMenu("「schedule」シート")
      .addItem("O列の開始日・P列の終了日を更新", "updateScheduleCellValues"))

  menu.addSubMenu(SpreadsheetApp.getUi().createMenu("「学生ごと提出状況」シート")
      .addItem("J:O列の遅延状況の色分け", "updateDelayStatus"))

  menu.addToUi();
}

function prompt(ui: Ui, message: string, defaultValue: any){
  const defaultValueView = defaultValue? `\n[${defaultValue}]`:'';
  const response = ui.prompt(`${message}${defaultValueView}`).getResponseText();
  return  (response === "")? defaultValue: response;
}

export function updateConfigSheet(){

  const ui = SpreadsheetApp.getUi();

  const _webappUrl = ScriptApp.getService().getUrl();
  if(_webappUrl == null){
    ui.alert("このスプレッドシートのコンテナに紐付けられたスクリプトを、Webアプリとしてデプロイしてください。\n"+
        "機能拡張->Apps Script->\n"+
        "デプロイ->新しいデプロイ->種類の選択->ウェブアプリ->デプロイ");
    return;
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  if(! sheet.getSheetName().endsWith("config")){
    ui.alert("いずれかの「config」シートを選択してからメニューを実行してください。");
    return;
  }

  const defaultValues = new Map();
  const values = sheet.getRange("A1:B9").getValues();
  values.forEach(row=>{defaultValues.set(row[0], row[1])});

  const formEditUrl = prompt(ui,`formEditUrl`, defaultValues.get('formEditUrl'));

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const form = FormApp.openByUrl(formEditUrl)
  const formResponseUrl = form.getPublishedUrl();

  if(form.getDestinationType() != FormApp.DestinationType.SPREADSHEET ||
      form.getDestinationId() != spreadsheet.getId()){
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  }

  const prefilledFormResponseUrl = prompt(ui,`prefilledFormResponseUrl?`, defaultValues.get('prefilledFormResponseUrl'));
  const dashboardUrl = prompt(ui,`published google site url?`, defaultValues.get('dashboardUrl'));

  const [ayearEntryId, studyAtEntryId, reportNumEntryId] = parsePrefilledUrl(prefilledFormResponseUrl);


  const webappUrl = prompt(ui,`webappUrl`, defaultValues.get('webappUrl'));

  sheet.getRange("A1:B9").setValues([
    ['numReports', form.getItems().find(item=>item.getTitle()==='報告回')?.asListItem().getChoices().length],
    ['prefilledFormResponseUrl', prefilledFormResponseUrl],
    ['formResponseUrl', formResponseUrl],
    ['formEditUrl', formEditUrl],
    ['ayearEntryId', ayearEntryId],
    ['studyAtEntryId', studyAtEntryId],
    ['reportNumEntryId', reportNumEntryId],
    ['webappUrl', webappUrl],
    ['dashboardUrl', dashboardUrl],
  ])

  updateTriggers();
}


// https://docs.google.com/forms/d/e/1FAIpQLScOXsG6YB2El_2PK3jp0-NvtmHJtgRyRtEuC5m3UQK6rVxVBQ/viewform?usp=pp_url&
// entry.228192827=2020&
// entry.1956434279=%E3%82%A2%E3%82%B8%E3%82%A2%E3%83%91%E3%82%B7%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E5%A4%A7%E5%AD%A6&
// entry.1865246731=1+%E5%9B%9E%E7%9B%AE
