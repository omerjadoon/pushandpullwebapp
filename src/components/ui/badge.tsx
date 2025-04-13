/* components/ui/badge.tsx */

import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'secondary'
}

export function Badge({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  
  const variantStyles = {
    default: "bg-primary text-white",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-800"
  }

  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`

  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}
