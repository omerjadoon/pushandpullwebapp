import * as React from "react";

// Define the types for Button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      children,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base classes that are always applied
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50";

    // Variant classes
    const variantClasses = {
      primary: "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90",
      secondary: "bg-[#F7F9FC] text-dark hover:bg-gray-200 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-1",
      destructive: "bg-[#D34053]/90 text-white hover:bg-[#D34053] dark:bg-[#D34053] dark:text-white dark:hover:bg-[#D34053]/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    // Size classes
    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    // Combine all classes
    const combinedClasses = `
      ${baseClasses}
      ${variantClasses[variant] || variantClasses.primary}
      ${sizeClasses[size] || sizeClasses.default}
      ${className}
    `.trim();

    return (
      <button
        type={type}
        className={combinedClasses}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
