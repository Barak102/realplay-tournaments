import { registerDecorator, ValidatorConstraint, type ValidationArguments, type ValidationOptions, type ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, arguments_: ValidationArguments): boolean {
    const [relatedProperty] = arguments_.constraints as [string];
    const relatedValue: unknown = (arguments_.object as Record<string, unknown>)[relatedProperty];
    const result = typeof value === 'string' && typeof relatedValue === 'string' && Date.parse(value) > Date.parse(relatedValue);

    return result;
  }

  defaultMessage(arguments_: ValidationArguments): string {
    const [relatedProperty] = arguments_.constraints as [string];
    const result = `${arguments_.property} must be strictly after ${relatedProperty}`;

    return result;
  }
}

export function IsAfter(relatedProperty: string, validationOptions?: ValidationOptions): PropertyDecorator {
  const result: PropertyDecorator = (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'isAfter',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      constraints: [relatedProperty],
      options: validationOptions,
      validator: IsAfterConstraint,
    });
  };

  return result;
}
