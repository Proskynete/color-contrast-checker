import { useEffect, useRef, useState } from "react";
import { Input } from "../../components/input";
import { ColorPickerModal } from "../../components/color-picker-modal";
import { hexValidator } from "../../helpers/validate.helper";

interface ColorPickerSectionProps {
  id: string;
  label: string;
  valuePropertyName: "background" | "text";
  value: string;
  setValue: (value: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ColorPickerSection = ({
  id,
  label,
  value,
  setValue,
  onChange,
  ...props
}: ColorPickerSectionProps) => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewButtonRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handlePreviewClick = () => {
    setShow((prev) => !prev);
  };

  const handleDownPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  const handleBlur = () => {
    const _value = value?.trim();
    const isValid = hexValidator(_value);
    const _label = label?.toLocaleLowerCase();

    if (_value === "") setError(`The ${_label} field is required.`);
    else if (_value.length !== 3 && _value.length !== 6)
      setError(`The ${_label} field must have 3 or 6 characters`);
    else if (_value.length === 3)
      setValue(
        `${_value[0]}${_value[0]}${_value[1]}${_value[1]}${_value[2]}${_value[2]}`
      );
    else if (!isValid) setError(`The ${_label} field is invalid.`);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        previewButtonRef.current?.contains(e.target as Node) ||
        modalRef.current?.contains(e.target as Node)
      )
        return;
      setShow(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <div
        className={`w-screen h-screen bg-black/60 fixed top-0 right-0 z-10 transition duration-300 
        ${show ? "opacity-1" : "opacity-0 pointer-events-none"}`}
      />

      <div className="relative">
        <Input
          id={id}
          label={label}
          onPreviewClick={handlePreviewClick}
          onKeyDownCapture={handleDownPress}
          onBlur={handleBlur}
          onChange={onChange}
          hasError={!!error}
          hint={error}
          value={value}
          previewButtonRef={previewButtonRef}
          {...props}
        />

        {show && (
          <div
            ref={modalRef}
            className="w-full h-[19rem] z-50 fixed grid bottom-0 right-0 p-5 bg-white border transition duration-300 md:max-h-fit mx-auto md:w-72 md:p-3 md:absolute md:rounded-lg md:shadow-lg md:bottom-0 md:-right-72"
          >
            <ColorPickerModal propertyName={props.valuePropertyName} />
            <Input
              id={`${id}-inside`}
              onKeyDownCapture={handleDownPress}
              onBlur={handleBlur}
              onChange={onChange}
              hasError={!!error}
              hint={error}
              value={value}
              hiddenPreview
              {...props}
            />
          </div>
        )}
      </div>
    </>
  );
};
