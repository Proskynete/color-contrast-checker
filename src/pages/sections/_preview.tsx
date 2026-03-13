import { useStore } from '@nanostores/react';

import { backgroundStore, textStore } from '../../store/values.store';

export const Preview = () => {
	const $background = useStore(backgroundStore);
	const $text = useStore(textStore);

	return (
		<div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
			<p className="text-xs font-semibold text-[#6B7280] mb-3">Vista previa</p>
			<div
				className="rounded-lg p-5"
				style={{ color: `#${$text}`, backgroundColor: `#${$background}` }}
			>
				<p className="text-2xl font-bold mb-2 leading-tight">Titulo de ejemplo</p>
				<p className="text-sm mb-4 leading-relaxed opacity-90">
					Este es un párrafo de ejemplo para visualizar cómo se ve el texto con esta combinación de colores. La legibilidad es fundamental para la accesibilidad web.
				</p>
				<div className="flex gap-2 flex-wrap">
					<button
						className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
						style={{ backgroundColor: `#${$text}`, color: `#${$background}` }}
					>
						Boton primario
					</button>
					<button
						className="px-4 py-2 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-80"
						style={{ borderColor: `#${$text}`, color: `#${$text}`, backgroundColor: 'transparent' }}
					>
						Boton secundario
					</button>
				</div>
			</div>
		</div>
	);
};
