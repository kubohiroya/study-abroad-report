export const updateDelayStatus = () => {
  const sheet = SpreadsheetApp.getActiveSheet();

  if (! sheet.getSheetName().endsWith("学生ごと提出状況")) {
    return;
  }

  const dueDates = new Map<string, number>()
  const schedules = sheet?.getRange("A2:P").getValues();
  schedules && schedules.forEach((row) => {
    if (!row || !row[0] || row[0] === "") {
      return;
    }
    const ayear = row[0];
    const studyAt = row[1];
    const reportNum = row[11];
    const dueDate = row[15];
    dueDates.set(`${ayear} ${studyAt} ${reportNum}`, dueDate.getTime());
  })

  const [head, ...body] = sheet.getRange("A1:O").getValues();
  const reportNums = new Array<string>();
  for (let col = 9; col <= 14; col++) {
    reportNums.push(head[col]);
  }

  body.forEach((row, rowIndex) => {
    if (!row || !row[0] || row[0] === "") {
      return;
    }

    const ayear = row[0];
    const studyAt = row[4];

    for (let i = 0; i <= 5; i++) {
      const reportNum = reportNums[i];
      const submissionDate = row[i + 9];
      const dueDate = dueDates.get(`${ayear} ${studyAt} ${reportNum}`);
      if (submissionDate && submissionDate !== "-" && submissionDate.getTime && dueDate && dueDate < submissionDate.getTime()) {
        sheet.getRange(rowIndex + 2, i + 10).setFontColor("red");
      }
    }
  });
}
