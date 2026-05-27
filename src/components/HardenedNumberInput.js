import React, { useState, useEffect } from "react";

const HardenedNumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  className,
  placeholder,
}) => {
  const [localValue, setLocalValue] = useState(
    value !== null && value !== undefined ? value.toString() : ""
  );
  const [error, setError] = useState("");

  const validate = (valStr) => {
    if (valStr.trim() === "") {
      return "Value is required";
    }
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      return "Please enter a valid number";
    }
    if (min !== undefined && num < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== undefined && num > max) {
      return `Value must be at most ${max}`;
    }
    return "";
  };

  // Synchronize local state with parent prop when changed externally (e.g. on reset/clear)
  useEffect(() => {
    const strVal = value !== null && value !== undefined ? value.toString() : "";
    setLocalValue(strVal);
    setError(validate(strVal));
  }, [value]);

  const handleChange = (e) => {
    let val = e.target.value;

    // Prevent multiple leading zeros for integers (e.g. "09" -> "9")
    if (/^0[0-9]/.test(val)) {
      val = val.replace(/^0+/, "");
    }

    setLocalValue(val);
    setError(validate(val));
  };

  const handleBlur = () => {
    let num = parseFloat(localValue);

    // Fallback if parsing fails or input is empty
    if (isNaN(num)) {
      num = min !== undefined ? min : 0;
    }

    // Enforce min constraint
    if (min !== undefined && num < min) {
      num = min;
    }

    // Enforce max constraint
    if (max !== undefined && num > max) {
      num = max;
    }

    // Round to step precision
    if (step) {
      const stepVal = parseFloat(step);
      if (!isNaN(stepVal)) {
        if (stepVal === 1) {
          num = Math.round(num);
        } else {
          // Calculate decimal precision from the step string (e.g. 0.01 has precision 2)
          const precision = (stepVal.toString().split(".")[1] || "").length;
          num = Number(num.toFixed(precision));
        }
      }
    }

    setLocalValue(num.toString());
    setError(""); // Clear error on blur since we clamped/sanitized it
    onChange(num);
  };

  return (
    <>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${className} ${error ? "input-error" : ""}`}
        placeholder={placeholder}
      />
      {error && (
        <span
          className="error-message"
          style={{
            color: "#e74c3c",
            fontSize: "11px",
            fontWeight: "500",
            marginTop: "2px",
            display: "block",
          }}
        >
          ⚠️ {error}
        </span>
      )}
    </>
  );
};

export default HardenedNumberInput;
