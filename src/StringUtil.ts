export class StringUtil {

  /**
   * 配列内の文字列を、指定された変数ラベル・変数値で置き換えする
   */
  static replace(src: string, labels: Array<string>, values: Array<string>) {
    let text = src;
    labels.forEach((label, index) => {
      text = text.split(`\${${label}}`).join(values[index]);
    });
    return text;
  }

  static replaceAll(textArray: Array<string>, labels: Array<string>, values: Array<string>) {
    return textArray.map(text => StringUtil.replace(text, labels, values));
  }

  static sanitize(str: string) {
    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return str && str.split('\n').map(s => String(s).replace(/[&<>"'`=\/]/g, function (s) {
      return entityMap[s];
    })).join('<br />');
  }
}
