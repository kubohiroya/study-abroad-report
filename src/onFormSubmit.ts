import FormsOnFormSubmit = GoogleAppsScript.Events.FormsOnFormSubmit;
import ItemResponse = GoogleAppsScript.Forms.ItemResponse;
import Form = GoogleAppsScript.Forms.Form;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Item = GoogleAppsScript.Forms.Item;
import {getConfigSheet} from "./SpreadsheetModules";
import {getPrefixByFormEditUrl} from "./FormUtil";
import {SHEET_PREFIX} from "./Config";

class StringUtil {

    /**
     * 配列内の文字列を、指定された変数ラベル・変数値で置き換えする
     */
    static replace(src: string, labels: string[], values: string[]) {
        let text = src;
        labels.forEach((label, index) => {
            text = text.split(`\${${label}}`).join(values[index]);
        });
        return text;
    }

    static replaceAll(textArray: string[], labels: string[], values: string[]) {
        return textArray.map(text => StringUtil.replace(text, labels, values));
    }
}

function onSubmitResponse(formId: string, prefix: string, timestamp: GoogleAppsScript.Base.Date, email: string, editResponseUrl: string, itemResponses: ItemResponse[]) {

    function getItems(form: Form) {
        return form.getItems().filter(item =>
            item.getType() !== FormApp.ItemType.PAGE_BREAK && item.getType() !== FormApp.ItemType.SECTION_HEADER
        );
    }

    function getItemResponseMap(itemResponses: ItemResponse[]) {
        return Object.fromEntries(itemResponses.map((itemResponse: ItemResponse) => {
            return [itemResponse.getItem().getId(), itemResponse];
        }));
    }

    function getResponse(items: Item[], itemResponseMap: {[key: string]:ItemResponse}) {
        return items.map(item => {
            const itemResponse = itemResponseMap[item.getId()];
            if (!itemResponse) {
                return null;
            }
            if (item.getType().toString() === "FILE_UPLOAD") {
                return (itemResponse.getResponse() as string[]).map(id => `https://drive.google.com/open?id=${id}`).join(", ");
            }
            return itemResponse.getResponse();
        });
    }

    function getConfigValue(prefix: string, ss: Spreadsheet, key: string) {
        const configSheet: Sheet = ss.getSheetByName(prefix+"config")!;
        const configRow = configSheet.getDataRange().getValues().find(row => row[0] === key);
        if (!configRow) {
            throw new Error(key+" is not defined in 'config' sheet");
        }
        return configRow[1];
    }

    function getWebappUrl(prefix: string, ss: Spreadsheet) {
        return getConfigValue(prefix, ss, 'webappUrl');
    }

    function getNumReports(prefix: string, ss: Spreadsheet) {
        return getConfigValue(prefix, ss, 'numReports');
    }

    function appendLogRow(prefix: string, ss: Spreadsheet, timestamp: GoogleAppsScript.Base.Date, email: string, editResponseUrl: string, responses: string[]) {
        const logSheet = ss.getSheetByName(prefix+"log")!;
        logSheet.appendRow([timestamp, email, editResponseUrl, ...responses]);
    }

    function getSpreadsheetUrl(member: {index: number}) {
        const gid = ss.getSheetByName(prefix+"学生・回ごと提出内容")!.getSheetId();
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${ss.getId()}/edit#gid=${gid}`;
        const memberIndex = member.index;
        const numReports = parseInt(getNumReports(prefix, ss));
        const rowStart = 2 + (memberIndex - 1) * numReports;
        const rowEnd = rowStart + numReports -1;
        return `${spreadsheetUrl}&range=${rowStart}:${rowEnd}`;
    }

    function getMailTemplate(prefix: string, ss: Spreadsheet) {
        const mailTemplates = ss.getSheetByName(prefix+"mailTemplate")!.getDataRange().getValues().filter(row => row[0] === "notify");
        if (mailTemplates.length !== 1) {
            throw new Error("Error: sheet 'mailTemplate' has no data row about: 'notify'");
        }
        return mailTemplates[0];
    }

    function getMember(prefix: string, ss: Spreadsheet, email: string) {
        const members = ss.getSheetByName("member")!.getDataRange().getValues().map((row, index) => ({
            row,
            index
        })).filter(item => item.row[2] + "@cuc.global" === email);
        if (members && members.length !== 1) {
            throw new Error("Error: sheet 'member' has no data row about: " + email);
        }
        return members[0];
    }

    const form: Form = FormApp.openById(formId);
    const responses = getResponse(getItems(form), getItemResponseMap(itemResponses));
    const ss = SpreadsheetApp.openById(form.getDestinationId());
    const webappUrl = getWebappUrl(prefix, ss);
    appendLogRow(prefix, ss, timestamp, email, editResponseUrl, responses as string[]);

    const member = getMember(prefix, ss, email);
    const [name, subjectTemplate, bodyTemplate] = getMailTemplate(prefix, ss);
    const reportNum = responses[2];
    const [ayear, studentId, accountId, displayName, studyAt, teacher] = member.row;
    const labels = ['ayear', 'studentId', 'displayName', 'studyAt', 'reportNum', 'spreadsheetUrl', 'webappUrl'];
    const values = [ayear, studentId, displayName, studyAt, reportNum,
        getSpreadsheetUrl(member),
        `${webappUrl}?student=${accountId}&mode=${prefix===SHEET_PREFIX.HEALTH_CHECK_PREFIX?'health':'report'}`
    ];
    const [subject, body] = StringUtil.replaceAll([subjectTemplate, bodyTemplate], labels, values);
    const from = 'CUC-FGS';
    const options = {
        name: from,
        noReply: true
    };
    const DEBUG = false;
    if (DEBUG) {
        Logger.log(JSON.stringify({teacher, subject, body}));
        return;
    }

    MailApp.sendEmail(teacher, subject, body, options);
}

export function onFormSubmit(ev: FormsOnFormSubmit) {
    const timestamp = ev.response.getTimestamp();
    const email = ev.response.getRespondentEmail();
    const formId = ev.source.getId();
    const form = FormApp.openById(formId);
    const sheet = getConfigSheet('formEditUrl', form.getEditUrl());
    if(! sheet){
        throw new Error("unmatched formEditUrl");
    }
    const prefix = getPrefixByFormEditUrl(sheet);
    if(! prefix) {
        throw new Error("unmatched sheet");
    }
    const editResponseUrl = ev.response.getEditResponseUrl();
    const itemResponses = ev.response.getItemResponses()
    onSubmitResponse(formId, prefix, timestamp, email, editResponseUrl, itemResponses);
}
