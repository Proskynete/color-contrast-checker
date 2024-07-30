import { HexColorPicker } from "react-colorful";
import { useStore } from "@nanostores/react";
import { backgroundStore, textStore } from "../store/values.store";

interface ColorPickerModalProps {
  propertyName: "background" | "text";
}

export const ColorPickerModal = ({ propertyName }: ColorPickerModalProps) => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  const handleChange = (color: string) => {
    if (propertyName === "background") backgroundStore.set(color.split("#")[1]);
    else textStore.set(color.split("#")[1]);
  };

  return (
    <HexColorPicker
      color={propertyName === "background" ? $background : $text}
      className="min-w-full md:w-auto md:h-auto md:aspect-[3/2]"
      onChange={handleChange}
    />
  );
};
