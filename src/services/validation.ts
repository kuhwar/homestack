import { createConnection } from 'net';
import type { ConfigField } from '../types/apps.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

class ValidationService {
  private static instance: ValidationService | null = null;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public validateField(field: ConfigField, value: unknown): ValidationError | null {
    const { key, label, type, validation } = field;

    // Check required
    if (validation?.required && (value === undefined || value === null || value === '')) {
      return { field: key, message: `${label} is required` };
    }

    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return null;
    }

    // Type-specific validation
    switch (type) {
      case 'string':
      case 'password':
        return this.validateString(field, value);

      case 'number':
        return this.validateNumber(field, value);

      case 'boolean':
        return this.validateBoolean(field, value);

      case 'select':
        return this.validateSelect(field, value);

      default:
        return null;
    }
  }

  private validateString(field: ConfigField, value: unknown): ValidationError | null {
    const { key, label, validation } = field;

    if (typeof value !== 'string') {
      return { field: key, message: `${label} must be a string` };
    }

    // Min length
    if (validation?.minLength !== undefined && value.length < validation.minLength) {
      return {
        field: key,
        message: validation.patternMessage || `${label} must be at least ${validation.minLength} characters`
      };
    }

    // Max length
    if (validation?.maxLength !== undefined && value.length > validation.maxLength) {
      return {
        field: key,
        message: `${label} must be at most ${validation.maxLength} characters`
      };
    }

    // Pattern
    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return {
          field: key,
          message: validation.patternMessage || `${label} has an invalid format`
        };
      }
    }

    return null;
  }

  private validateNumber(field: ConfigField, value: unknown): ValidationError | null {
    const { key, label, validation } = field;

    const numValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numValue)) {
      return { field: key, message: `${label} must be a valid number` };
    }

    // Min value
    if (validation?.min !== undefined && numValue < validation.min) {
      return {
        field: key,
        message: `${label} must be at least ${validation.min}`
      };
    }

    // Max value
    if (validation?.max !== undefined && numValue > validation.max) {
      return {
        field: key,
        message: `${label} must be at most ${validation.max}`
      };
    }

    return null;
  }

  private validateBoolean(field: ConfigField, value: unknown): ValidationError | null {
    const { key, label } = field;

    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      return { field: key, message: `${label} must be a boolean` };
    }

    return null;
  }

  private validateSelect(field: ConfigField, value: unknown): ValidationError | null {
    const { key, label, options } = field;

    if (!options || options.length === 0) {
      return null;
    }

    const validValues = options.map(opt => opt.value);
    if (!validValues.includes(String(value))) {
      return {
        field: key,
        message: `${label} must be one of: ${validValues.join(', ')}`
      };
    }

    return null;
  }

  public validateConfiguration(
    fields: ConfigField[],
    config: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of fields) {
      const value = config[field.key];
      const error = this.validateField(field, value);

      if (error) {
        errors.push(error);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public async validatePortAvailability(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = createConnection({ port, host: '127.0.0.1' });

      socket.once('connect', () => {
        socket.destroy();
        resolve(false); // Port is in use
      });

      socket.once('error', (err: NodeJS.ErrnoException) => {
        socket.destroy();
        // ECONNREFUSED means nothing is listening - port is available
        // ENOTFOUND means host not found - port is available
        resolve(err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND');
      });

      // Timeout after 1 second
      socket.setTimeout(1000, () => {
        socket.destroy();
        resolve(true); // Assume available on timeout
      });
    });
  }
}

export const validationService = ValidationService.getInstance();
export default ValidationService;
