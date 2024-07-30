export const HEX_REGEX = /^([A-Fa-f0-9]{6})$/;

export const hexValidator = (value: string) => HEX_REGEX.test(value);
