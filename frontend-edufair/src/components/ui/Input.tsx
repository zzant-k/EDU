import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase px-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-surface border border-border-custom rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ease-in-out ${
            error ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger font-medium px-1 mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
