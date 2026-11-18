import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const styles = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded-2xl',
    circle: 'h-12 w-12 rounded-full',
  }

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${styles[variant]} ${className}`}
    />
  )
}
