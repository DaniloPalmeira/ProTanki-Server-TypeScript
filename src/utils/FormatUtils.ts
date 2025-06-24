export class FormatUtils {
  /**
   * Mascara um endereço de e-mail para exibição segura.
   * Ex: "danilo@gmail.com" se torna "d*****o@g****l.com"
   */
  public static maskEmail(email: string): string {
    if (!email || email.indexOf("@") === -1) {
      return "";
    }

    const [localPart, domain] = email.split("@");
    const [domainName, domainTld] = domain.split(".");

    const mask = (str: string) => {
      if (str.length <= 2) {
        return str.length === 1 ? "*" : "**";
      }
      return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
    };

    const maskedLocalPart = mask(localPart);
    const maskedDomainName = mask(domainName);

    return `${maskedLocalPart}@${maskedDomainName}.${domainTld}`;
  }
}
