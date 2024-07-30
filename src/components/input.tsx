import { useRef, useState } from "react";
import { hexValidator } from "../helpers/validate.helper";
import { DEFAULT_VALUES } from "../config/constants";
import { textStore, backgroundStore } from "../store/values.store";
import { ColorPickerModal } from "./color-picker-modal";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  valuePropertyName: "background" | "text";
}

export const Input = ({
  id,
  label,
  defaultValue,
  valuePropertyName,
  ...props
}: InputProps) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const colorBoxElementRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError(null);

    if (value.length <= 6) {
      setValue(value);
      if (valuePropertyName === "background") backgroundStore.set(value);
      else textStore.set(value);
    }
  };

  const handleDownPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const handleBlur = () => {
    const _value = (value as string)?.trim();
    const isValid = hexValidator(value as string);
    const _label = label.toLocaleLowerCase();

    if (_value === "") setError(`The ${_label} field is required.`);
    else if (_value.length !== 3 && _value.length !== 6)
      setError(`The ${_label} field must have 3 or 6 characters`);
    else if (_value.length === 3)
      setValue(
        `${_value[0]}${_value[0]}${_value[1]}${_value[1]}${_value[2]}${_value[2]}`
      );
    else if (!isValid) setError(`The ${_label} field is invalid.`);
  };

  const previewOnClick = () => {
    setShow(!show);
  };

  return (
    <>
      <div className="relative flex flex-col gap-1">
        <label htmlFor={id} className="block text-sm font-bold text-slate-700">
          {label}
        </label>

        <div className="relative w-full h-fit">
          <div className="absolute flex h-full pl-3 items-center justify-center">
            <span className={`${error ? "text-red-400" : "text-gray-600"}`}>
              #
            </span>
          </div>

          <input
            {...props}
            id={id}
            name={id}
            type="text"
            className={`w-full rounded-lg p-2 pl-6 text-md uppercase bg-transparent border border-spacing-0.5 focus:outline-none transition-colors duration-300 ${
              error
                ? "border-red-500 text-red-400 focus:border-red-500 hover:border-red-300"
                : "focus:border-gray-900 hover:border-gray-400 text-gray-700"
            }`}
            value={value}
            onChange={handleChange}
            onKeyDownCapture={handleDownPress}
            onBlur={handleBlur}
          />

          <div
            role="button"
            className={`absolute top-1 right-1 border rounded-lg w-8 h-8 cursor-pointer ${
              error ? "border-red-300" : "border-gray-300"
            }`}
            style={{
              backgroundColor: `${
                error ? `#${DEFAULT_VALUES.BACKGROUND_COLOR}` : `#${value}`
              }`,
            }}
            onClick={previewOnClick}
          />
        </div>

        <div
          ref={colorBoxElementRef}
          className={`w-full h-[19rem] fixed bottom-0 right-0 grid p-5 bg-white border z-20 transition duration-300 md:max-h-fit mx-auto md:w-72 md:p-3 md:absolute md:rounded-lg md:shadow-lg md:bottom-11 md:-right-32
                ${show ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
        >
          <ColorPickerModal valuePropertyName={valuePropertyName} />
        </div>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </>
  );
};
