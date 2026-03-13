import { useStore } from '@nanostores/react';
import { HexColorPicker } from 'react-colorful';

import { backgroundStore, textStore } from '../store/values.store';

interface ColorPickerModalProps {
	fieldName: 'background' | 'text';
}

export const ColorPickerModal = ({ fieldName }: ColorPickerModalProps) => {
	const $background = useStore(backgroundStore);
	const $text = useStore(textStore);

	const handleChange = (color: string) => {
		if (fieldName === 'background') backgroundStore.set(color.split('#')[1]);
		else textStore.set(color.split('#')[1]);
	};

	return (
		<HexColorPicker
			color={fieldName === 'background' ? $background : $text}
			className="min-w-full md:w-auto md:h-auto md:aspect-[3/2]"
			onChange={handleChange}
		/>
	);
};
