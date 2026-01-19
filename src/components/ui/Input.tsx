import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`w-full px-4 py-2
            rounded-lg border border-gray-300 bg-white
            text-gray-900 placeholder-gray-500
            transition-colors duration-200
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:bg-gray-100
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
