import { useStore } from '@nanostores/react';

import { backgroundStore, textStore } from '../../store/values.store';

export const Preview = () => {
	const $background = useStore(backgroundStore);
	const $text = useStore(textStore);

	return (
		<div
			className="w-full md:w-1/2 flex flex-col justify-center p-8 md:rounded-r-xl rounded-b-xl md:rounded-b-none min-h-52"
			style={{ color: `#${$text}`, backgroundColor: `#${$background}` }}
		>
			<p className="text-3xl font-semibold mb-2 leading-tight">The quick brown fox</p>
			<p className="text-base mb-3 leading-relaxed opacity-90">
				Aa — Contrast ratio preview for body text at normal size.
			</p>
			<p className="text-xs leading-relaxed opacity-75">
				Caption · Small text must meet 4.5:1 for WCAG AA compliance.
			</p>
		</div>
	);
};
