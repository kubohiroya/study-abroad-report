const form = FormApp.getActiveForm();
const spreadsheetId = form.getDestinationId();
const gid = SpreadsheetApp.openById(spreadsheetId).getSheetByName("学生・回ごと提出内容").getSheetId();
const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${gid}`;
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

function onSubmitResponse(timestamp, email, editResponseUrl, itemResponses) {
    function getItems(form) {
        return form.getItems().filter(item =>
            item.getType() !== FormApp.ItemType.PAGE_BREAK && item.getType() !== FormApp.ItemType.SECTION_HEADER
        );
    }

    function getItemResponseMap(itemResponses) {
        return Object.fromEntries(itemResponses.map(itemResponse => {
            return [itemResponse.getItem().getId(), itemResponse];
        }));
    }

    function getResponse(items, itemResponseMap) {
        return items.map(item => {
            const itemResponse = itemResponseMap[item.getId()];
            if (!itemResponse) {
                return null;
            }
            if (item.getType().toString() === "FILE_UPLOAD") {
                return itemResponse.getResponse().map(id => `https://drive.google.com/open?id=${id}`).join(", ");
            }
            return itemResponse.getResponse();
        });
    }

    function getWebappUrl(ss) {
        const configSheet = ss.getSheetByName("config");
        const configRow = configSheet.getDataRange().getValues().find(row => row[0] === "webappUrl");
        if (!configRow) {
            throw new Error("webappUrl is not defined in 'config' sheet");
        }
        return configRow[1];
    }

    function appendLogRow(ss, timestamp, email, editResponseUrl, responses) {
        const logSheet = ss.getSheetByName("log");
        logSheet.appendRow([timestamp, email, editResponseUrl, ...responses]);
    }

    function getSpreadsheetUrl(member) {
        const memberIndex = member.index;
        const rowStart = 2 + (memberIndex - 1) * 6;
        const rowEnd = rowStart + 5;
        return `${spreadsheetUrl}&range=${rowStart}:${rowEnd}`;
    }

    function getMailTemplate(ss) {
        const mailTemplates = ss.getSheetByName("mailTemplate").getDataRange().getValues().filter(row => row[0] === "notify");
        if (mailTemplates.length !== 1) {
            throw new Error("Error: sheet 'mailTemplate' has no data row about: 'notify'");
        }
        return mailTemplates[0];
    }

    function getMember(ss, email) {
        const members = ss.getSheetByName("member").getDataRange().getValues().map((row, index) => ({
            row,
            index
        })).filter(item => item.row[2] + "@cuc.global" === email);
        if (members && members.length !== 1) {
            throw new Error("Error: sheet 'member' has no data row about: " + email);
        }
        return members[0];
    }

    const responses = getResponse(getItems(form), getItemResponseMap(itemResponses));

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const webappUrl = getWebappUrl(ss);
    appendLogRow(ss, timestamp, email, editResponseUrl, responses);

    const member = getMember(ss, email);
    const [name, subjectTemplate, bodyTemplate] = getMailTemplate(ss);
    const reportNum = responses[2];
    const [ayear, studentId, accountId, displayName, studyAt, teacher] = member.row;
    const labels = ['ayear', 'studentId', 'displayName', 'studyAt', 'reportNum', 'spreadsheetUrl', 'webappUrl'];
    const values = [ayear, studentId, displayName, studyAt, reportNum,
        getSpreadsheetUrl(member),
        `${webappUrl}?student=${accountId}`
    ];
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

function onFormSubmit(ev) {
    const timestamp = ev.response.getTimestamp();
    const email = ev.response.getRespondentEmail();
    // const url = ev.response.getFormId
    const editResponseUrl = ev.response.getEditResponseUrl();
    const itemResponses = ev.response.getItemResponses()
    onSubmitResponse(timestamp, email, editResponseUrl, itemResponses);
}

function test() {
    const timestamp = new Date();
    const email = 'hiroya@cuc.global';
    const editResponseUrl = 'https://example.com/'
    onSubmitResponse(timestamp, email, editResponseUrl);
}
