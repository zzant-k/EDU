import React from 'react'

interface CircularProgressProps {
  value: number // 0 to 100
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
  className?: string
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  children,
  className = '',
}) => {
  const percentage = Math.min(Math.max(value, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 fill-transparent"
          strokeWidth={strokeWidth}
        />
        {/* Animated indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-primary fill-transparent transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {children ? (
          children
        ) : (
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}
