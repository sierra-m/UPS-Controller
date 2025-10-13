export const firstLetterCaps = (text: string) => {
  if (text && (text.length > 1)) {
    return text[0]!.toUpperCase() + text.slice(1);
  }
  return '';
};
