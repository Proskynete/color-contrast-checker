import { CONSTANTS } from "../../../config/constants";
import { useContrast } from "../../../hooks/useContrast";
import { ColorInput } from "../../../components/input";
import { HexColorPicker } from "react-colorful";

const FormSection = () => {
  const { values, setValues } = useContrast();

  return (
    <section className="border rounded-xl flex flex-col md:flex-row gap-5 divide-x">
      <div className="flex flex-col gap-4 w-full md:w-1/2 p-8">
        <div className="w-ful">
          <ColorInput
            id={CONSTANTS.ID.TEXT}
            label="Text color"
            defaultValue={CONSTANTS.COLORS.TEXT}
            enableColorPicker={(hexValue, setHexValue, onInputChange) => (
              <>
                <HexColorPicker
                  color={hexValue}
                  className="!w-full md:!w-auto md:!h-auto md:aspect-[3/2]"
                  onChange={(color) => {
                    setHexValue(color.split("#")[1]);
                    setValues &&
                      setValues({
                        ...values,
                        [CONSTANTS.ID.TEXT]: color.split("#")[1],
                      });
                  }}
                />

                <div className="w-full h-fit mt-4">
                  <div className="relative">
                    <div className="absolute flex h-full pl-3 items-center justify-center">
                      <span>#</span>
                    </div>

                    <input
                      id={`${CONSTANTS.ID.TEXT}-inside`}
                      name={`${CONSTANTS.ID.TEXT}-inside`}
                      type="text"
                      className="w-full border rounded-lg p-2 pl-6 uppercase"
                      value={hexValue}
                      onChange={onInputChange}
                    />

                    <div
                      className="absolute top-1 right-1 border rounded-lg w-8 h-8"
                      style={{ backgroundColor: `#${hexValue}` }}
                    />
                  </div>
                </div>
              </>
            )}
          />
        </div>

        <div className="w-full">
          <ColorInput
            id={CONSTANTS.ID.BACKGROUND}
            label="Background color"
            defaultValue={CONSTANTS.COLORS.BACKGROUND}
            enableColorPicker={(hexValue, setHexValue, onInputChange) => (
              <>
                <HexColorPicker
                  color={hexValue}
                  className="!w-full md:!w-auto md:!h-auto md:aspect-[3/2]"
                  onChange={(color) => {
                    setHexValue(color.split("#")[1]);
                    setValues &&
                      setValues({
                        ...values,
                        [CONSTANTS.ID.BACKGROUND]: color.split("#")[1],
                      });
                  }}
                />

                <div className="w-full h-fit mt-4">
                  <div className="relative">
                    <div className="absolute flex h-full pl-3 items-center justify-center">
                      <span>#</span>
                    </div>

                    <input
                      id={`${CONSTANTS.ID.BACKGROUND}-inside`}
                      name={`${CONSTANTS.ID.BACKGROUND}-inside`}
                      type="text"
                      className="w-full border rounded-lg p-2 pl-6 uppercase"
                      value={hexValue}
                      onChange={onInputChange}
                    />

                    <div
                      className="absolute top-1 right-1 border border-gray-300 rounded-lg w-8 h-8"
                      style={{ backgroundColor: `#${hexValue}` }}
                    />
                  </div>
                </div>
              </>
            )}
          />
        </div>
      </div>

      <div
        className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:p-8 py-20 rounded-b-xl md:rounded-tr-xl md:rounded-bl-none"
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
  );
};

export { FormSection };
