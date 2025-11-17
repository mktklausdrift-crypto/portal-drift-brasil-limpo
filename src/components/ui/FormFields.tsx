"use client"

import * as React from 'react'
import { useAriaId } from '@/lib/accessibility'

export interface FormFieldProps {
  label: string
  id?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactElement
}

export function FormField({
  label,
  id: providedId,
  error,
  hint,
  required = false,
  children
}: FormFieldProps) {
  const autoId = useAriaId('field')
  const id = providedId || autoId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  // Clone o child element para adicionar props de acessibilidade
  const accessibilityProps = {
    id,
    'aria-invalid': error ? 'true' as const : 'false' as const,
    'aria-describedby': [
      hint ? hintId : null,
      error ? errorId : null
    ].filter(Boolean).join(' ') || undefined,
    'aria-required': required
  }
  
  const childWithProps = React.cloneElement(children, accessibilityProps as any)

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="obrigatório">
            *
          </span>
        )}
      </label>

      {hint && !error && (
        <p
          id={hintId}
          className="text-sm text-gray-500"
        >
          {hint}
        </p>
      )}

      {childWithProps}

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseClasses = "block w-full rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
    }

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error'
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseClasses = "block w-full rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
    }

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'error'
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', variant = 'default', placeholder, children, ...props }, ref) => {
    const baseClasses = "block w-full rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    
    const variantClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
    }

    return (
      <select
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id: providedId, ...props }, ref) => {
    const autoId = useAriaId('checkbox')
    const id = providedId || autoId
    const descId = `${id}-description`

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className}`}
            aria-describedby={description ? descId : undefined}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={id} className="font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {description && (
            <p id={descId} className="text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', id: providedId, ...props }, ref) => {
    const autoId = useAriaId('radio')
    const id = providedId || autoId
    const descId = `${id}-description`

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={id}
            type="radio"
            className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${className}`}
            aria-describedby={description ? descId : undefined}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={id} className="font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {description && (
            <p id={descId} className="text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Radio.displayName = 'Radio'
