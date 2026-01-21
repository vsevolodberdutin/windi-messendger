import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input placeholder="Type here" />);

    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('should apply default styling classes', () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('w-full', 'px-4', 'py-2', 'rounded-lg', 'border');
  });

  it('should display error message when error prop is provided', () => {
    render(<Input error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styling when error prop is provided', () => {
    render(<Input data-testid="error-input" error="Error message" />);

    const input = screen.getByTestId('error-input');
    expect(input).toHaveClass('border-red-500');
  });

  it('should not display error message when error prop is not provided', () => {
    render(<Input placeholder="Normal input" />);

    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);

    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('should accept a ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="With ref" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should handle value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should apply additional className', () => {
    render(<Input className="custom-class" data-testid="custom-input" />);

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveClass('custom-class');
  });

  it('should pass through additional HTML attributes', () => {
    render(<Input type="email" name="email" id="email-input" placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('id', 'email-input');
  });

  it('should have displayName set', () => {
    expect(Input.displayName).toBe('Input');
  });
});
