type File = GoogleAppsScript.Drive.Schema.File;

export class DriveUtil {

  static getFileIdByUrl(url: string): string {
    const [base, fileId] = url.split(/=/);
    return fileId;
  }

  static getFileByFileId(fileId: string): File | undefined {
    return Drive.Files?.get(fileId);
  }

  static getDriveFileHTML(urlStrArray: string): Array<string> {
    if (!urlStrArray) {
      return [];
    }

    return urlStrArray.split(/, /).map((url) => {
      if (!url || url === "") {
        return "";
      }
      let out = `<a target="_blank" href="${url}">`;

      const fileId = DriveUtil.getFileIdByUrl(url);
      const file = DriveUtil.getFileByFileId(fileId);
      const mimeType = file?.mimeType;
      const thumbnailSrc = file?.thumbnailLink;

      if (mimeType) {
        if (mimeType.startsWith("image")) {
          out += `<img alt="image" src="${thumbnailSrc}">`;
        } else if (mimeType.startsWith("video")) {
          out += `<div class="video"><img alt="video" src="${thumbnailSrc}"><div class="overlay"><span class="material-icons">play_circle</span></div></div>`;
        } else {
          out += `(${mimeType} file)`
        }
      }
      out += "</a>";
      return out;
    });
  }
}
