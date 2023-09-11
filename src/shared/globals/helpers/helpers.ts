export class Helpers{
  static firstLEtterUpperCase(str : string): string{
    const valueString = str.toLowerCase();
    return valueString
                      .split(' ')
                      .map((value:string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLocaleLowerCase()}`)
                      .join(' ');
  }

  static lowerCase(str: string): string{
    return str.toLowerCase();
  }

  static generateRandomIntWithLength(length: number): number {
    if (length <= 0) {
      throw new Error("Length must be greater than 0");
    }

    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static parseJson(prop: string): any{
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
