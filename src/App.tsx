import { Footer } from "./components/footer";
import { ColorInput } from "./components/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as FullStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as EmptyStar } from "@fortawesome/free-regular-svg-icons";
import { useContrast } from "./hooks/useContrast";
import { CONSTANTS } from "./config/constants";

type Contrast = "good" | "warning" | "error";

const App = () => {
  const { values } = useContrast();
  const contrast: Contrast = "good";

  const contrastColors = {
    good: "bg-green-300/30 text-green-900",
    warning: "bg-yellow-300/30 text-yellow-900",
    error: "bg-red-300/30 text-red-900",
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <header className="text-center">
        <h1 className="text-4xl font-bold py-8">Color Contrast Checker</h1>
      </header>

      <main className="w-2/3 lg:w-4/5 max-w-4xl mx-auto flex flex-col gap-5">
        <section className="border rounded-xl flex flex-col md:flex-row gap-5 divide-x">
          <div className="flex flex-col gap-4 w-full md:w-1/2 p-8">
            <div className="w-ful">
              <ColorInput
                id={CONSTANTS.ID.TEXT}
                label="Text color"
                defaultValue={CONSTANTS.COLORS.TEXT}
              />
            </div>

            <div className="w-full">
              <ColorInput
                id={CONSTANTS.ID.BACKGROUND}
                label="Background color"
                defaultValue={CONSTANTS.COLORS.BACKGROUND}
              />
            </div>
          </div>

          <div
            className="w-full md:w-1/2 flex flex-col items-center justify-center text-center p-8 rounded-tr-xl rounded-br-xl"
            style={{
              color: `#${values.textColor}`,
              backgroundColor: `#${values.backgroundColor}`,
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
        </section>

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
      </main>

      <Footer />
    </div>
  );
};

export default App;
