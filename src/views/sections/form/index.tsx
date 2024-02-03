import { CONSTANTS } from "../../../config/constants";
import { useContrast } from "../../../hooks/useContrast";
import { ColorInput } from "../../../components/input";

const FormSection = () => {
  const { values } = useContrast();

  return (
    <section className="border rounded-xl flex flex-col md:flex-row gap-5 divide-x">
      <div className="flex flex-col gap-4 w-full md:w-1/2 p-8">
        <div className="w-ful">
          <ColorInput
            id={CONSTANTS.ID.TEXT}
            label="Text color"
            defaultValue={CONSTANTS.COLORS.TEXT}
            enableColorPicker
          />
        </div>

        <div className="w-full">
          <ColorInput
            id={CONSTANTS.ID.BACKGROUND}
            label="Background color"
            defaultValue={CONSTANTS.COLORS.BACKGROUND}
            enableColorPicker
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
  );
};

export { FormSection };
