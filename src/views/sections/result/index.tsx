import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as FullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as EmptyStar } from "@fortawesome/free-regular-svg-icons";
import { useContrast } from "../../../hooks/useContrast";
import { useEffect, useState } from "react";

type Contrast = "good" | "warning" | "error";

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

  useEffect(() => {
    if (result) {
      const _large =
        result < 1 / 4.5 ? "good" : result < 1 / 3 ? "warning" : "error";
      const _small =
        result < 1 / 7 ? "good" : result < 1 / 4.5 ? "warning" : "error";

      setState({ smallText: _small, largeText: _large });
    }
  }, [result]);

  const contrast: Contrast = "good";
  const contrastColors = {
    good: "bg-green-600/30 text-green-900",
    warning: "bg-yellow-600/30 text-yellow-900",
    error: "bg-red-600/30 text-red-900",
  };

  return (
    <section className="w-full lg:w-2/3 mx-auto">
      <div className="w-full flex flex-col lg:flex-row gap-0.5">
        <div
          className={`w-2/3 flex flex-col content-center justify-center p-4 rounded-l-xl ${contrastColors[contrast]}`}
        >
          <p className="text-xl font-bold">
            {state.largeText === "good" &&
              state.smallText === "good" &&
              "Excellent"}

            {(state.largeText === "warning" && state.smallText === "good") ||
              (state.largeText === "good" &&
                state.smallText === "warning" &&
                "Good")}

            {(state.largeText === "error" && state.smallText === "good") ||
              (state.largeText === "warning" &&
                state.smallText === "warning") ||
              (state.largeText === "good" &&
                state.smallText === "error" &&
                "Fair")}

            {(state.largeText === "error" && state.smallText === "warning") ||
              (state.largeText === "warning" && state.smallText === "error") ||
              (state.largeText === "error" &&
                state.smallText === "error" &&
                "Poor")}
          </p>

          <p className="text-xs">
            The contrast ratio between the text and the background is{" "}
            {result?.toFixed(2)}
          </p>
        </div>

        <div className="w-1/3 flex flex-col gap-0.5">
          <div
            className={`p-4 ${contrastColors[state.largeText!]} rounded-tr-xl`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Small Text</h2>
              <div>
                <FontAwesomeIcon icon={FullStar} />
                <FontAwesomeIcon icon={FullStar} />
                <FontAwesomeIcon icon={EmptyStar} />
              </div>
            </div>
          </div>

          <div
            className={`p-4 ${contrastColors[state.smallText!]} rounded-br-xl`}
          >
            <div className="text-xs flex justify-between">
              <h2 className="font-bold">Large Text</h2>
              <div>
                <FontAwesomeIcon icon={FullStar} />
                <FontAwesomeIcon icon={FullStar} />
                <FontAwesomeIcon icon={FullStar} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ResultSection };
