const form = FormApp.getActiveForm();
const spreadsheetId = form.getDestinationId();
const gid = SpreadsheetApp.openById(spreadsheetId).getSheetByName("学生・回ごと提出内容").getSheetId();
const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}`; // 384349305
const DEBUG = false;
const from = 'CUC-FGS';

class StringUtil {

    /**
     * 配列内の文字列を、指定された変数ラベル・変数値で置き換えする
     */
    static replace(src, labels, values) {
        let text = src;
        labels.forEach((label, index) => {
            text = text.split(`\${${label}}`).join(values[index]);
        });
        return text;
    }

    static replaceAll(textArray, labels, values) {
        return textArray.map(text => StringUtil.replace(text, labels, values));
    }
}

function onSubmit(ev) {
    const editResponseUrl = ev.response.getEditResponseUrl();
    const email = ev.response.getRespondentEmail();
    const timestamp = ev.response.getTimestamp();

    const items = form.getItems().filter(item =>
        item.getType() !== FormApp.ItemType.PAGE_BREAK && item.getType() !== FormApp.ItemType.SECTION_HEADER
    );

    const itemResponses = Object.fromEntries(ev.response.getItemResponses().map(itemResponse => {
        return [itemResponse.getItem().getId(), itemResponse];
    }));

    const responses = items.map(item => {
        const itemResponse = itemResponses[item.getId()];
        if (!itemResponse) {
            return null;
        }
        if (item.getType().toString() === "FILE_UPLOAD") {
            return itemResponse.getResponse().map(id => `https://drive.google.com/open?id=${id}`).join(", ");
        }
        return itemResponse.getResponse();
    });

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const logSheet = ss.getSheetByName("log");
    logSheet.appendRow([timestamp, email, editResponseUrl, ...responses]);

    const mailTemplates = ss.getSheetByName("mailTemplate").getDataRange().getValues().filter(row => row[0] === "notify");
    if (mailTemplates.length !== 1) {
        throw new Error("Error: sheet 'mailTemplate' has no data row about: 'notify'");
    }

    const members = ss.getSheetByName("member").getDataRange().getValues().map((row, index) => ({
        row,
        index
    })).filter(item => item.row[2] + "@cuc.global" === email);
    if (members && members.length !== 1) {
        throw new Error("Error: sheet 'members' has no data row about: " + email);
    }

    const [name, subjectTemplate, bodyTemplate] = mailTemplates[0];
    const reportNum = responses[2];

    const [ayear, studentId, accountId, displayName, studyAt, teacher] = members[0].row;
    const memberIndex = members[0].index;
    const rowStart = 2 + (memberIndex - 1) * 6;
    const rowEnd = rowStart + 5;

    const labels = ['ayear', 'studentId', 'displayName', 'studyAt', 'reportNum', 'spreadsheetUrl'];
    const values = [ayear, studentId, displayName, studyAt, reportNum, `${spreadsheetUrl}&range=${rowStart}:${rowEnd}`];
    const [subject, body] = StringUtil.replaceAll([subjectTemplate, bodyTemplate], labels, values);
    const options = {
        name: from,
        noReply: true
    };

    if (DEBUG) {
        Logger.log(JSON.stringify({teacher, subject, body}));
        return;
    }

    MailApp.sendEmail(teacher, subject, body, options);
}
