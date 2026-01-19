import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('should render with default medium size', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('should render with small size', () => {
    render(<Spinner size="sm" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render with large size', () => {
    render(<Spinner size="lg" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should have loading aria-label', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should apply additional className', () => {
    render(<Spinner className="mt-4" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('mt-4');
  });

  it('should have animation class', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });
});
