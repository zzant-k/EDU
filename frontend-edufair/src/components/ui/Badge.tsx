import React from 'react'

interface BadgeProps {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    neutral: 'bg-text-secondary/10 text-text-secondary border-text-secondary/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
