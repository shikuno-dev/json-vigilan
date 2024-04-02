import { _prettify } from "./prettify";
import { _tokenize } from "./tokenizer";
import { Token } from "./types";

export const jsonVigilant = {
  tokenize: (jsonText: string): Token[] => _tokenize(jsonText),
  prettify: (jsonText: string, indentation: string= '\t'): string => _prettify(jsonText, indentation)
};