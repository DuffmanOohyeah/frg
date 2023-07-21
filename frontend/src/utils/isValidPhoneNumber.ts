// Rules from https://frankgroup.atlassian.net/browse/NGW-381
const isValidPhoneNumber = (x: string): boolean => x.length >= 6;

export default isValidPhoneNumber;
