export class DriveUtil {

  static getFile(url: string): { contentType: string, thumbnailData: string } {
    const [base, fileId] = url.split(/=/);
    try {
      const file = DriveApp.getFileById(fileId);
      const contentType = file.getBlob().getContentType();
      const thumbnailBlob = file.getThumbnail();
      const thumbnailContentType = thumbnailBlob.getContentType();
      const thumbnailEncodedBytes = Utilities.base64Encode(thumbnailBlob.getBytes());
      return {
        contentType,
        thumbnailData: 'data:' + thumbnailContentType + ';base64,' + thumbnailEncodedBytes
      };
    } catch (error) {
      Logger.log("Invalid URL " + error + " = " + url);
      throw error;
    }
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
      const file = DriveUtil.getFile(url);
      if (file.contentType.startsWith("image")) {
        out += `<img alt="image" src="${file.thumbnailData}">`;
      } else if (file.contentType.startsWith("video")) {
        out += `<div class="video"><img alt="video" src="${file.thumbnailData}"><div class="overlay"><span class="material-icons">play_circle</span></div></div>`;
      } else {
        out += `(${file.contentType} file)`
      }
      out += "</a>";
      return out;
    });
  }
}
