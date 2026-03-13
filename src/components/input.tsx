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
				<label htmlFor={id} className="text-xs font-semibold text-[#374151]">
					{label}
				</label>
			)}

			<div className="flex items-center gap-2">
				{/* Color swatch on left — opens picker */}
				{!hiddenPreview && (
					<div
						ref={previewButtonRef}
						role="button"
						aria-label="Open color picker"
						className={`w-10 h-10 rounded-lg cursor-pointer border-2 shrink-0 transition-colors ${
							hasError
								? 'border-red-300'
								: 'border-[#E5E7EB] hover:border-[#9CA3AF]'
						}`}
						style={{
							backgroundColor: `#${hasError ? DEFAULT_VALUES.BACKGROUND_COLOR : props.value}`,
						}}
						onClick={onPreviewClick}
					/>
				)}

				{/* Hex input */}
				<div className="relative flex-1">
					<span
						className={`absolute inset-y-0 left-3 flex items-center text-sm pointer-events-none ${
							hasError ? 'text-red-400' : 'text-[#9CA3AF]'
						}`}
						style={{ fontFamily: 'var(--font-mono, monospace)' }}
					>
						#
					</span>
					<input
						id={id}
						name={id}
						type="text"
						className={`w-full h-10 rounded-lg pl-7 pr-3 text-sm uppercase border transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 ${
							hasError
								? 'border-red-300 text-red-500 focus:border-red-400 focus:ring-red-100'
								: 'border-[#E5E7EB] text-[#111827] hover:border-[#D1D5DB] focus:border-[#374151] focus:ring-[#374151]/10'
						}`}
						style={{ fontFamily: 'var(--font-mono, monospace)' }}
						{...props}
					/>
				</div>
			</div>

			{hasError && <span className="text-xs text-red-500">{hint}</span>}
		</div>
	);
};
