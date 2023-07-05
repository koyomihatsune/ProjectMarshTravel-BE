export {};

declare global {
  interface String {
    format(...replacements: string[]): string;
  }
}

if (!String.prototype.format) {
  String.prototype.format = function (...replacements: string[]) {
    const args = replacements;
    return this.replace(/{(\d+)}/g, function (match: any, number: number) {
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}
