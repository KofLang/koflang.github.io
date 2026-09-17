/**
 * Diagnóstico Kof — o contrato R6 do playground: todo erro tem CÓDIGO e LINHA,
 * nunca silêncio. Os códigos (SEM0xx / PARSE0xx / LEX00x / DB001 / HTTP003 …)
 * são os mesmos que `kof check` emite no compilador oficial (Kof4j).
 */
export class KofDiag extends Error {
  readonly code: string;
  readonly line: number;

  constructor(message: string, code: string, line = 0) {
    super(message);
    this.name = "KofDiag";
    this.code = code;
    this.line = line;
  }

  override toString(): string {
    const at = this.line > 0 ? ` (linha ${this.line})` : "";
    return `✕ ${this.message}${at} [${this.code}]`;
  }
}
