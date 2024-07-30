import { HexColorPicker } from "react-colorful";
import { useStore } from "@nanostores/react";
import { backgroundStore, textStore } from "../store/values.store";

interface ColorPickerModalProps {
  valuePropertyName: "text" | "background";
}

export const ColorPickerModal = ({
  valuePropertyName,
}: ColorPickerModalProps) => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  return (
    <HexColorPicker
      color={valuePropertyName === "background" ? $background : $text}
      className="min-w-full md:w-auto md:h-auto md:aspect-[3/2]"
      onChange={(color) => {
        if (valuePropertyName === "background")
          backgroundStore.set(color.split("#")[1]);
        else textStore.set(color.split("#")[1]);
      }}
    />
  );
};
