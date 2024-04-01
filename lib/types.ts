export const TokenType = {
  StructuralCharacter: 0,
  String: 1,
  Number: 2,
  LiteralName: 3,
  Key: 4,
  Unexpected: 5
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export type Token = {
  type: TokenType;
  value: string;
  index: number;
  position: {line: number, column: number };
  isValid: boolean;
  closingLine?: number;
  depth?: number,
  message?: string;
};

export type EndBracket = "]" | "}";
