import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 'primary' = The default Google Blue style
   * 'success' = The Green "Copied!" style
   */
  variant?: 'primary' | 'success';
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  icon,
  ...props
}: ButtonProps) => {
  
  // Shared base styles (Geometry, Fonts, Animation)
  const baseStyles = "w-full py-3 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-[0.98]";

  // Variant specific colors
  const variantStyles = {
    primary: "bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#062E6F]",
    success: "bg-[#C4EED0] text-[#0F5223]"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && (
        // Ensure icon sizing is consistent
        <span className="w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};