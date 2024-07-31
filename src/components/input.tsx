import { DEFAULT_VALUES } from "../config/constants";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valuePropertyName: "background" | "text";
  onPreviewClick?: () => void;
  previewButtonRef?: React.RefObject<HTMLDivElement>;
  hasError?: boolean;
  hint?: string | null;
  hiddenPreview?: boolean;
}

export const Input = ({
  id,
  label,
  defaultValue,
  valuePropertyName,
  previewButtonRef,
  onPreviewClick,
  hasError,
  hint,
  hiddenPreview = false,
  ...props
}: InputProps) => {
  return (
    <div className="relative flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative w-full h-fit">
        <div className="absolute flex h-full pl-3 items-center justify-center">
          <span className={`${hasError ? "text-red-400" : "text-gray-600"}`}>
            #
          </span>
        </div>

        <input
          id={id}
          name={id}
          type="text"
          className={`w-full rounded-lg p-2 pl-6 text-md uppercase bg-transparent border border-spacing-0.5 focus:outline-none transition-colors duration-300 ${
            hasError
              ? "border-red-500 text-red-400 focus:border-red-500 hover:border-red-300"
              : "focus:border-gray-900 hover:border-gray-400 text-gray-700"
          }`}
          {...props}
        />

        {!hiddenPreview && (
          <div
            ref={previewButtonRef}
            role="button"
            className={`absolute top-1 right-1 border rounded-lg w-8 h-8 cursor-pointer ${
              hasError ? "border-red-300" : "border-gray-300"
            }`}
            style={{
              backgroundColor: `${
                hasError
                  ? `#${DEFAULT_VALUES.BACKGROUND_COLOR}`
                  : `#${props.value}`
              }`,
            }}
            onClick={onPreviewClick}
          />
        )}
      </div>

      {hasError && <span className="text-xs text-red-500">{hint}</span>}
    </div>
  );
};
