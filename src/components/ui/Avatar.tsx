interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

export function Avatar({ src, alt, size = 'md', isOnline }: AvatarProps) {
  return (
    <div className="relative inline-block shrink-0">
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full
          bg-gray-200 object-cover`}
      />
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block
            h-2.5 w-2.5 rounded-full ring-2 ring-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      )}
    </div>
  );
}
