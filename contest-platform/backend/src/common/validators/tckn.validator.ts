import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isTCKN', async: false })
export class IsTCKNConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value || value.length !== 11 || !/^\d{11}$/.test(value)) return false;
    if (value.charAt(0) === '0') return false;

    const digits = value.split('').map(Number);

    // d10 = (odd_sum * 7 - even_sum) mod 10
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const computed10 = (oddSum * 7 - evenSum) % 10;
    if (computed10 !== digits[9]) return false;

    // d11 = sum of first 10 digits mod 10
    const sum10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    if (sum10 % 10 !== digits[10]) return false;

    return true;
  }

  defaultMessage(): string {
    return 'Geçersiz TC Kimlik Numarası';
  }
}

export function IsTCKN(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTCKNConstraint,
    });
  };
}
