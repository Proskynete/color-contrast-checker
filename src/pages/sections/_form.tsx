import { useStore } from '@nanostores/react';

import { backgroundStore, textStore } from '../../store/values.store';
import { ColorPickerSection } from './_color-picker-modal';

export const Form = () => {
	const $background = useStore(backgroundStore);
	const $text = useStore(textStore);

	const handleChange = (field: 'text' | 'background') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value.length <= 6) {
			if (field === 'background') backgroundStore.set(value);
			else textStore.set(value);
		}
	};

	const handleSetValue = (field: 'text' | 'background') => (value: string) => {
		if (field === 'background') backgroundStore.set(value);
		else textStore.set(value);
	};

	const handleSwap = () => {
		const currentText = textStore.get();
		const currentBg = backgroundStore.get();
		textStore.set(currentBg);
		backgroundStore.set(currentText);
	};

	return (
		<div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
			<h2 className="text-sm font-semibold text-[#111827] mb-4">Colores</h2>
			<div className="flex flex-col gap-3">
				<ColorPickerSection
					id="text-color"
					label="Texto (Foreground)"
					fieldName="text"
					value={$text}
					setValue={handleSetValue('text')}
					onChange={handleChange('text')}
				/>

				<div className="flex items-center justify-center">
					<button
						onClick={handleSwap}
						className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#374151] border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M4 3l-3 3 3 3M1 6h10M12 13l3-3-3-3M15 10H5" />
						</svg>
						Intercambiar
					</button>
				</div>

				<ColorPickerSection
					id="background-color"
					label="Fondo (Background)"
					fieldName="background"
					value={$background}
					setValue={handleSetValue('background')}
					onChange={handleChange('background')}
				/>
			</div>
		</div>
	);
};
