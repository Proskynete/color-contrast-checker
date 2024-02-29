import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useContrast } from "../../hooks/useContrast";
import { CONSTANTS } from "../../config/constants";

interface ColorInputProps {
  label: string;
  id: string;
  defaultValue?: string;
  enableColorPicker: (
    hexValue: string,
    setHexValue: (value: string) => void,
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  ) => JSX.Element | undefined;
}

const ColorInput = ({
  id,
  label,
  defaultValue = CONSTANTS.COLORS.DEFAULT,
  enableColorPicker,
}: ColorInputProps) => {
  const { values, setValues } = useContrast();
  const [hex, setHex] = useState(defaultValue);
  const [show, setShow] = useState(false);
  const boxElementRef = useRef<HTMLDivElement>(null);
  const colorBoxElementRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 6) return;
    if (value.length <= 6) {
      setHex(value);
      setValues && setValues({ ...values, [id]: value });
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        boxElementRef.current?.contains(e.target as Node) ||
        colorBoxElementRef.current?.contains(e.target as Node)
      )
        return;
      setShow(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>

      <div className="relative w-full h-fit">
        <div className="absolute flex h-full pl-3 items-center justify-center">
          <span>#</span>
        </div>

        <input
          id={id}
          name={id}
          type="text"
          className="w-full rounded-lg p-2 pl-6 uppercase bg-transparent border border-spacing-0.5 hover:border-gray-400 focus:border-blue-400 focus:outline-none transition-colors duration-300"
          value={hex}
          onChange={handleChange}
          onBlur={() => {
            if (hex.length === 0) setHex(CONSTANTS.COLORS.DEFAULT);
          }}
        />

        <div
          className={`absolute top-1 right-1 border rounded-lg w-8 h-8 ${
            enableColorPicker !== undefined
              ? "cursor-pointer"
              : "cursor-default"
          }`}
          style={{ backgroundColor: `#${hex}` }}
          ref={boxElementRef}
          onClick={() => enableColorPicker !== undefined && setShow(!show)}
        />

        {enableColorPicker !== undefined && show && (
          <div
            ref={colorBoxElementRef}
            className="w-72 absolute grid p-3 bg-white border rounded-lg shadow-lg z-10 bottom-11 right-0 lg:-right-32"
          >
            {enableColorPicker(hex, setHex, handleChange)}
          </div>
        )}
      </div>
    </div>
  );
};

export { ColorInput };
