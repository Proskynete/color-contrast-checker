import { useState } from "react";
import { Input } from "../../components/input";
import { ColorPickerModal } from "../../components/color-picker-modal";

interface ColorPickerSectionProps {
  id: string;
  label: string;
  valuePropertyName: "background" | "text";
  defaultValue: string;
  inputValue: string;
}

export const ColorPickerSection = (props: ColorPickerSectionProps) => {
  const [show, setShow] = useState(false);

  const handlePreviewClick = () => {
    setShow((prev) => !prev);
  };

  return (
    <>
      <div
        className={`w-screen h-screen bg-black/60 fixed top-0 right-0 z-10 transition duration-300 
        ${show ? "opacity-1" : "opacity-0 pointer-events-none"}`}
      />

      <div className="relative">
        <Input {...props} onPreviewClick={handlePreviewClick} />

        {show && (
          <div className="w-full h-[19rem] absolute grid p-5 bg-white border z-20 transition duration-300 md:max-h-fit mx-auto md:w-72 md:p-3 md:absolute md:rounded-lg md:shadow-lg md:bottom-11 md:-right-32 opacity-100">
            <ColorPickerModal propertyName={props.valuePropertyName} />
            <Input
              id={`${props.id}-inside`}
              valuePropertyName={props.valuePropertyName}
              defaultValue={props.inputValue}
            />
          </div>
        )}
      </div>
    </>
  );
};
