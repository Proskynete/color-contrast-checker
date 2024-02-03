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

  const contrastColors = {
    good: "bg-green-600/30 text-green-900",
    warning: "bg-yellow-600/30 text-yellow-900",
    error: "bg-red-600/30 text-red-900",
  };

  useEffect(() => {
    if (result) {
      const _large = evaluateResult(result, 1 / 7, 1 / 4.5);
      const _small = evaluateResult(result, 1 / 4.5, 1 / 3);
      setState({ smallText: _small, largeText: _large });
    }
  }, [result]);

  return (
    <section className="w-full lg:w-2/3 mx-auto">
      <div className="w-full flex flex-col lg:flex-row gap-0.5">
        <div
          className={`w-2/3 flex flex-col content-center justify-center p-4 rounded-l-xl ${
            contrastColors[
              textToShow({
                largeText: state.largeText!,
                smallText: state.smallText!,
              }).label as Contrast
            ]
          }`}
        >
          <p className="text-xl font-bold">
            {
              textToShow({
                largeText: state.largeText!,
                smallText: state.smallText!,
              }).title
            }
          </p>
          <p className="text-xs">
            {
              textToShow({
                largeText: state.largeText!,
                smallText: state.smallText!,
              }).description
            }
          </p>
        </div>

        <div className="w-1/3 flex flex-col gap-0.5">
          <div
            className={`p-4 ${contrastColors[state.largeText!]} rounded-tr-xl`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Small Text</h2>
              <StarMakerSection assessment={state.largeText!} />
            </div>
          </div>

          <div
            className={`p-4 ${contrastColors[state.smallText!]} rounded-br-xl`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Large Text</h2>
              <StarMakerSection assessment={state.smallText!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ResultSection };
