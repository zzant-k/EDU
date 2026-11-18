import React from 'react'

interface ProgressBarProps {
  value: number // 0 to 100
  className?: string
  showLabel?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  showLabel = false,
}) => {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-sm font-semibold">
          <span className="text-text-secondary">Progress</span>
          <span className="text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-border-custom/50">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
