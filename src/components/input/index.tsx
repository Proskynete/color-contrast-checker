import { useState } from "react";

interface ColorInputProps {
  label: string;
  id: string;
  defaultValue?: string;
}

const ColorInput = ({
  id,
  label,
  defaultValue = "000000",
}: ColorInputProps) => {
  const [hex, setHex] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 6) return;
    if (value.length <= 6) setHex(value);
  };

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
          className="w-full border rounded-lg p-2 pl-6"
          value={hex}
          onChange={handleChange}
          onBlur={() => {
            if (hex.length === 0) setHex("000000");
          }}
        />

        <div
          className="absolute top-1 right-1 border rounded-lg w-8 h-8 pointer"
          style={{ backgroundColor: `#${hex}` }}
        />
      </div>
    </div>
  );
};

export { ColorInput };
