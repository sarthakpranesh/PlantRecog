import H1 from "./H1";
import H2 from "./H2";
import H3 from "./H3";
import Paragraph from "./Paragraph";

export { H1, H2, H3, Paragraph };

export const HTextFormatter = (text: string) => {
  const firstLetter = text.split("")[0].toUpperCase();
  const formatted = firstLetter + text.slice(1, text.length);
  return formatted;
};
