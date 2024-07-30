import { ColorPickerSection } from "./_color-picker-modal";
import { DEFAULT_VALUES } from "../../config/constants";
import { useStore } from "@nanostores/react";
import { backgroundStore, textStore } from "../../store/values.store";

export const Form = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  return (
    <div className="flex relative flex-col gap-4 w-full md:w-1/2 p-8">
      <div className="w-full">
        <ColorPickerSection
          id="text-color"
          label="Text color"
          valuePropertyName="text"
          defaultValue={DEFAULT_VALUES.TEXT_COLOR}
          inputValue={$text}
        />
      </div>

      <div className="w-full">
        <ColorPickerSection
          id="background-color"
          label="Background color"
          valuePropertyName="background"
          defaultValue={DEFAULT_VALUES.BACKGROUND_COLOR}
          inputValue={$background}
        />
      </div>
    </div>
  );
};
