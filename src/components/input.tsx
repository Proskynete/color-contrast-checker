import { DEFAULT_VALUES } from '../config/constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	onPreviewClick?: () => void;
	previewButtonRef?: React.RefObject<HTMLDivElement>;
	hasError?: boolean;
	hint?: string | null;
	hiddenPreview?: boolean;
}

export const Input = ({
	id,
	label,
	previewButtonRef,
	onPreviewClick,
	hasError,
	hint,
	hiddenPreview = false,
	...props
}: InputProps) => {
	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label htmlFor={id} className="text-xs font-medium text-[#6B6860] uppercase tracking-wider">
					{label}
				</label>
			)}

			<div className="relative w-full">
				<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<span className={`text-sm ${hasError ? 'text-red-400' : 'text-[#9C9A93]'}`}
						style={{ fontFamily: 'var(--font-mono, monospace)' }}>
						#
					</span>
				</div>

				<input
					id={id}
					name={id}
					type="text"
					className={`w-full h-10 rounded-lg pl-7 pr-12 text-sm uppercase border transition-colors duration-150 bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 ${
						hasError
							? 'border-red-300 text-red-500 focus:border-red-400 focus:ring-red-100'
							: 'border-[#E2E0DA] text-[#1A1917] hover:border-[#C9C7BF] focus:border-[#1A1917] focus:ring-[#1A1917]/10'
					}`}
					style={{ fontFamily: 'var(--font-mono, monospace)' }}
					{...props}
				/>

				{!hiddenPreview && (
					<div
						ref={previewButtonRef}
						role="button"
						aria-label="Open color picker"
						className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-md cursor-pointer border transition-colors ${
							hasError ? 'border-red-200' : 'border-[#E2E0DA] hover:border-[#C9C7BF]'
						}`}
						style={{
							backgroundColor: `#${hasError ? DEFAULT_VALUES.BACKGROUND_COLOR : props.value}`,
						}}
						onClick={onPreviewClick}
					/>
				)}
			</div>

			{hasError && <span className="text-xs text-red-500">{hint}</span>}
		</div>
	);
};
