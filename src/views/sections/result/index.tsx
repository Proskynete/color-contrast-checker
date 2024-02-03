import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as FullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as EmptyStar } from "@fortawesome/free-regular-svg-icons";

type Contrast = "good" | "warning" | "error";

const ResultSection = () => {
  const contrast: Contrast = "good";
  const contrastColors = {
    good: "bg-green-300/30 text-green-900",
    warning: "bg-yellow-300/30 text-yellow-900",
    error: "bg-red-300/30 text-red-900",
  };

  return (
    <section className="w-full md:w-2/3 mx-auto">
      <div
        className={`rounded-xl p-4 flex items-center justify-between gap-4 ${contrastColors[contrast]}`}
      >
        <div className="w-full lg:w-1/2 flex justify-center flex-col items-center">
          <p className="text-5xl font-black">21</p>
          <p>Excellent contrast!</p>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-2 items-center">
          <div className="flex flex-col">
            <p className="text-sm">Large text</p>
            <div>
              <FontAwesomeIcon icon={FullStar} />
              <FontAwesomeIcon icon={FullStar} />
              <FontAwesomeIcon icon={EmptyStar} />
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm">Normal text</p>
            <div>
              <FontAwesomeIcon icon={FullStar} />
              <FontAwesomeIcon icon={FullStar} />
              <FontAwesomeIcon icon={EmptyStar} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ResultSection };
