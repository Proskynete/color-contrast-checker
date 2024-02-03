import { useContrast } from "../../../hooks/useContrast";
import { useEffect, useState } from "react";
import { Contrast, textToShow } from "../../../helpers/texts";
import { StarMakerSection } from "../../../components/stars";
import { evaluateResult } from "../../../helpers/contrast-checker";

interface State {
  smallText?: Contrast;
  largeText?: Contrast;
}

const defaultState: State = {
  smallText: "good",
  largeText: "good",
};

const ResultSection = () => {
  const { result } = useContrast();
  const [state, setState] = useState(defaultState);
  const text = textToShow({
    largeText: state.largeText!,
    smallText: state.smallText!,
  });

  const contrastColors = {
    good: "bg-green-600/30 text-green-900",
    warning: "bg-yellow-600/30 text-yellow-900",
    error: "bg-red-600/30 text-red-900",
  };

  useEffect(() => {
    if (result) {
      const _large = evaluateResult(result, 1 / 4.5, 1 / 3);
      const _small = evaluateResult(result, 1 / 7, 1 / 4.5);
      setState({ smallText: _small, largeText: _large });
    }
  }, [result]);

  return (
    <section className="w-full lg:w-3/4 mx-auto">
      <div className="w-full flex flex-col lg:flex-row gap-0.5">
        <div
          className={`w-full lg:w-2/3 flex flex-col justify-center text-center md:text-left p-4 rounded-xl lg:rounded-l-xl lg:rounded-r-none ${
            contrastColors[text.label as Contrast]
          }`}
        >
          <p className="text-xl font-bold">{text.title}</p>
          <p className="text-xs">{text.description}</p>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-0.5">
          <div
            className={`p-4 ${
              contrastColors[state.smallText!]
            } rounded-xl lg:rounded-tr-xl lg:rounded-l-none lg:rounded-br-none`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Small Text</h2>
              <StarMakerSection assessment={state.smallText!} />
            </div>
          </div>

          <div
            className={`p-4 ${
              contrastColors[state.largeText!]
            } rounded-xl lg:rounded-br-xl lg:rounded-l-none lg:rounded-tr-none`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Large Text</h2>
              <StarMakerSection assessment={state.largeText!} />
            </div>
          </div>
        </div>
      </div>

      {text.suggestion && (
        <ul className="w-8/10 mt-2 ml-6 lg:ml-8 list-disc text-pretty grid gap-1">
          {text.suggestion?.map((suggestion, i) => (
            <li key={i} className="text-xs text-gray-600">
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export { ResultSection };
