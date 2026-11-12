import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './FormInput.css';

export const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error = '',
  helperText = '',
  autoComplete,
  disabled = false,
  multiline = false,
  rows = 4,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // Construct aria-describedby for accessible screen readers
  const ariaDescribedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <div className="form-label-row">
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="required-indicator" aria-hidden="true">*</span>}
          </label>
        </div>
      )}

      {helperText && (
        <span id={helperId} className="form-helper-text">
          {helperText}
        </span>
      )}

      <div className="input-wrapper">
        {multiline ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            data-error={errorId}
            className="form-control form-textarea"
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={effectiveType}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            data-error={errorId}
            className={`form-control ${isPassword ? 'has-password-toggle' : ''}`}
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <div id={errorId} className="form-error-msg" role="alert">
          <AlertCircle size={14} className="form-error-icon" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
