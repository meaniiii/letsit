interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card = ({ children, onClick, className = '' }: CardProps) => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md border border-gray-100
        transition-shadow duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
