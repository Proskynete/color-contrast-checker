import { useStore } from "@nanostores/react";
import { backgroundStore, textStore } from "../../store/values.store";
import { getContrastResults } from "../../helpers/contrast.helper";

export const ContrastResult = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  const { ratio, levels, classification } = getContrastResults({
    text: `#${$text}`,
    background: `#${$background}`,
  });

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row gap-0.5">
        <div
          className={`w-full lg:w-2/3 flex flex-col justify-center text-center md:text-left p-4 rounded-xl lg:rounded-l-xl lg:rounded-r-none ${classification.styles} transition-colors duration-300`}
        >
          <div className="flex flex-col">
            <p className="text-2xl font-bold">{classification.title}</p>
            <p className="text-sm flex gap-1">
              The contrast ratio is
              <span className="font-semibold">{ratio.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-0.5">
          {levels.map((level) => (
            <div
              key={level.title}
              className={`p-4 rounded-xl lg:rounded-l-none transition-colors duration-300 ${
                level.styles
              }  ${
                level.key === "large"
                  ? "lg:rounded-tr-xl lg:rounded-br-none"
                  : "lg:rounded-br-xl lg:rounded-tr-none"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold">{level.title}</h2>
                <p className="text-xs font-semibold">{level.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-8/10 mt-1 ml-2 lg:ml-3 text-pretty gap-1">
        <p className="text-xs text-gray-600">{classification.detail}</p>
      </div>
    </>
  );
};
