import { customRandom, random } from "nanoid";

const numericAlphabet = "0123456789";
export const nanoid = customRandom(numericAlphabet, 8, random);
