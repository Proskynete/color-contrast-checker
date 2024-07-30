import { useStore } from "@nanostores/react";
import { backgroundStore, textStore } from "../../store/values.store";

export const Preview = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  return (
    <div
      className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:p-8 py-20 rounded-b-xl md:rounded-tr-xl md:rounded-bl-none"
      style={{
        color: `#${$text}`,
        backgroundColor: `#${$background}`,
      }}
    >
      <p className="text-3xl font-bold mb-2">Lorem ipsum.</p>
      <p className="text text-sm">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
      </p>
      <p className="text text-xs">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
      </p>
    </div>
  );
};
