// validate date from text input in french format and convert it to a date object
export function validateDate(date: string): Date {
  const [day, month, year] = date.split('/');
  if (isNaN(+day) || isNaN(+month) || isNaN(+year)) {
    throw new Error('Invalid date');
  }
  return new Date(+year, +month - 1, +day);
}

// function that validates the format of a GUID string
export function validateGuid(guid: string): boolean {
  return /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(guid);
}

// function that validates the format of an IPV6 address string
// note: this function does not accept shortened IPV6 addresses
export function validateIpv6(ipv6: string): boolean {
  return /^([0-9a-f]{1,4}:){7}([0-9a-f]{1,4})$/.test(ipv6);
}

// validate phone number from text input and extract the country code
export function validatePhoneNumber(phoneNumber: string): string {
  if (!/^(\+\d{1,3})?\d{9,15}$/.test(phoneNumber)) {
    throw new Error('Invalid phone number');
  }
  const match = phoneNumber.match(/^(\+\d{1,3})?/);
  if (match) {
    return match[0];
  } else {
    throw new Error('Invalid phone number');
  }
}
