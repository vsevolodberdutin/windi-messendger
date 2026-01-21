import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should render image with correct src and alt', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('should apply default size (md)', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('w-10', 'h-10');
  });

  it('should apply small size', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" size="sm" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('w-8', 'h-8');
  });

  it('should apply large size', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" size="lg" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('w-12', 'h-12');
  });

  it('should show online indicator when isOnline is true', () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="Test User" isOnline={true} />
    );

    const indicator = container.querySelector('span');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-green-500');
  });

  it('should show offline indicator when isOnline is false', () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="Test User" isOnline={false} />
    );

    const indicator = container.querySelector('span');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-gray-400');
  });

  it('should not show indicator when isOnline is undefined', () => {
    const { container } = render(
      <Avatar src="https://example.com/avatar.jpg" alt="Test User" />
    );

    const indicator = container.querySelector('span');
    expect(indicator).not.toBeInTheDocument();
  });
});
