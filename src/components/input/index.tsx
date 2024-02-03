import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useContrast } from "../../hooks/useContrast";
import { CONSTANTS } from "../../config/constants";
import { HexColorPicker } from "react-colorful";

interface ColorInputProps {
  label: string;
  id: string;
  defaultValue?: string;
  enableColorPicker?: boolean;
}

const ColorInput = ({
  id,
  label,
  defaultValue = CONSTANTS.COLORS.DEFAULT,
  enableColorPicker = false,
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
    <div className="relative flex flex-col gap-2">
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
          className="w-full border rounded-lg p-2 pl-6 uppercase bg-transparent"
          value={hex}
          onChange={handleChange}
          onBlur={() => {
            if (hex.length === 0) setHex(CONSTANTS.COLORS.DEFAULT);
          }}
        />

        <div
          className={`absolute top-1 right-1 border rounded-lg w-8 h-8 ${
            enableColorPicker ? "cursor-pointer" : "cursor-default"
          }`}
          style={{ backgroundColor: `#${hex}` }}
          ref={boxElementRef}
          onClick={() => enableColorPicker && setShow(!show)}
        />

        {enableColorPicker && show && (
          <div
            ref={colorBoxElementRef}
            className="w-72 absolute p-4 bg-white border rounded-lg shadow-lg z-10 right-0 lg:-right-32"
          >
            <HexColorPicker
              color={hex}
              className="!w-auto"
              onChange={(color) => {
                setHex(color.split("#")[1]);
                setValues &&
                  setValues({ ...values, [id]: color.split("#")[1] });
              }}
            />

            <div className="relative w-full h-fit mt-4">
              <div className="absolute flex h-full pl-3 items-center justify-center">
                <span>#</span>
              </div>

              <input
                id={`${id}-inside`}
                name={`${id}-inside`}
                type="text"
                className="w-full border rounded-lg p-2 pl-6 uppercase"
                value={hex}
                onChange={handleChange}
              />

              <div
                className="absolute top-1 right-1 border rounded-lg w-8 h-8"
                style={{ backgroundColor: `#${hex}` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ColorInput };
