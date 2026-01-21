let counter = 0;

export const nanoid = () => {
  counter += 1;
  return `test-id-${counter}`;
};

export const customAlphabet = () => () => {
  counter += 1;
  return `test-custom-id-${counter}`;
};

export const urlAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
