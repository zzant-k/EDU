import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-border-custom rounded-2xl p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer hover:border-primary/20' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
