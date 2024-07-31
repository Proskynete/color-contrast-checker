import { useStore } from "@nanostores/react";

import { backgroundStore, textStore } from "../../store/values.store";
import { ColorPickerSection } from "./_color-picker-modal";

export const Form = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  const handleChange =
    (field: "text" | "background") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length <= 6) {
        if (field === "background") backgroundStore.set(value);
        else textStore.set(value);
      }
    };

  const handleSetValue = (field: "text" | "background") => (value: string) => {
    if (field === "background") backgroundStore.set(value);
    else textStore.set(value);
  };

  return (
    <div className="flex relative flex-col gap-4 w-full md:w-1/2 p-8">
      <div className="w-full">
        <ColorPickerSection
          id="text-color"
          label="Text color"
          valuePropertyName="text"
          value={$text}
          setValue={handleSetValue("text")}
          onChange={handleChange("text")}
        />
      </div>

      <div className="w-full">
        <ColorPickerSection
          id="background-color"
          label="Background color"
          valuePropertyName="background"
          value={$background}
          setValue={handleSetValue("text")}
          onChange={handleChange("background")}
        />
      </div>
    </div>
  );
};
