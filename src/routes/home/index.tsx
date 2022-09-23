import { h } from 'preact';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Home = () => {
	const [color, setColor] = useState('');
	const [generatedColors, setGeneratedColors] = useState<ColorPalette[]>([
		generateColors('532345'),
	]);
	const [exportText, setExport] = useState('');

	const handleEnter = () => {
		const colors = generateColors(color);
		if (colors) {
			setGeneratedColors((prev) => [...prev, colors]);
		}
	};

	const handleExport = () => {
		const exportColors = generatedColors.reduce((acc: any, curr) => {
			acc[curr.name] = curr.colors;
			return acc;
		}, {});
		const output = JSON.stringify(exportColors, null, 4);
		setExport(output);

		if (navigator.clipboard && window.isSecureContext) {
			// navigator clipboard api method'
			return navigator.clipboard.writeText(output);
		}
		const textArea = document.createElement('textarea');
		textArea.value = output;
		// make the textarea out of viewport
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		return new Promise((res, rej) => {
			// here the magic happens
			document.execCommand('copy') ? res(true) : rej(false);
			textArea.remove();
		});
	};

	return (
		<div className='w-full mx-5 min-h-screen'>
			<div className='max-w-7xl mx-auto my-24'>
				<div className='mx-auto max-w-xl flex justify-center mb-5 items-center'>
					<input
						type='text'
						className='bg-white border-gray-300 border rounded-md shadow-sm py-1.5 px-3 w-full'
						onInput={(e) => setColor(e.currentTarget.value)}
						placeholder='Enter a hex color'
						value={color}
					/>
					<button
						type='button'
						onClick={handleEnter}
						className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4'>
						Search
					</button>
				</div>
				<div>
					{generatedColors &&
						generatedColors.map((color, colorIdx) => (
							<div
								key={colorIdx}
								className='grid grid-cols-11 grid-rows-1 gap-x-2'>
								{Object.keys(color.colors).map(
									(hex: string, idx: number) => (
										<div
											key={idx}
											className='flex flex-col max-w-full max-wh-full'>
											<div
												className='w-full h-full aspect-square border'
												style={{
													backgroundColor:
														color.colors[hex],
												}}
											/>
											<p className='text-center'>{hex}</p>
										</div>
									)
								)}
								<div className='flex justify-center items-center aspect-square'>
									<button
										type='button'
										onClick={() => {
											const newColors = [
												...generatedColors,
											];
											newColors.splice(colorIdx, 1);
											setGeneratedColors(newColors);
										}}
										className='inline-flex items-center rounded-full border border-transparent bg-red-600 p-1.5 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>
										<XMarkIcon
											className='h-5 w-5'
											aria-hidden='true'
										/>
									</button>
								</div>
							</div>
						))}
				</div>
				<div className='flex justify-center items-center mt-5'>
					<button
						type='button'
						onClick={handleExport}
						className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
						Export
					</button>
				</div>
				{exportText.length > 0 && (
					<div className='mt-5 bg-gray-100 rounded-md px-4 py-2 font-mono'>
						{/* Show json string pretty */}
						<pre>{exportText}</pre>
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;

export type ColorPalette = {
	name: string;
	colors: {
		[key: string]: string;
	};
};

type Rgb = {
	r: number;
	g: number;
	b: number;
};

function hexToRgb(hex: string): Rgb | null {
	const sanitizedHex = hex.replace('/##/g', '#');
	const colorParts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
		sanitizedHex
	);

	if (!colorParts) {
		return null;
	}

	const [, r, g, b] = colorParts;

	return {
		r: parseInt(r, 16),
		g: parseInt(g, 16),
		b: parseInt(b, 16),
	} as Rgb;
}

function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getTextColor(color: string): '#FFF' | '#333' {
	const rgbColor = hexToRgb(color);

	if (!rgbColor) {
		return '#333';
	}

	const { r, g, b } = rgbColor;
	const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

	return luma < 120 ? '#FFF' : '#333';
}

function lighten(hex: string, intensity: number): string {
	const color = hexToRgb(`#${hex}`);

	if (!color) {
		return '';
	}

	const r = Math.round(color.r + (255 - color.r) * intensity);
	const g = Math.round(color.g + (255 - color.g) * intensity);
	const b = Math.round(color.b + (255 - color.b) * intensity);

	return rgbToHex(r, g, b);
}

function darken(hex: string, intensity: number): string {
	const color = hexToRgb(hex);

	if (!color) {
		return '';
	}

	const r = Math.round(color.r * intensity);
	const g = Math.round(color.g * intensity);
	const b = Math.round(color.b * intensity);

	return rgbToHex(r, g, b);
}

export function getColorName(color: string): string {
	const name = `#${color}`;
	const sanitizedName = name
		.replace(/['/]/gi, '')
		.replace(/\s+/g, '-')
		.toLowerCase();

	return sanitizedName;
}

export function generateColors(baseColor: string): ColorPalette {
	const name = getColorName(baseColor);

	const response: ColorPalette = {
		name,
		colors: {
			500: `#${baseColor}`.replace('##', '#'),
		},
	};

	const intensityMap: {
		[key: number]: number;
	} = {
		50: 0.95,
		100: 0.9,
		200: 0.75,
		300: 0.6,
		400: 0.3,
		600: 0.9,
		700: 0.75,
		800: 0.6,
		900: 0.49,
	};

	[50, 100, 200, 300, 400].forEach((level) => {
		response.colors[level] = lighten(baseColor, intensityMap[level]);
	});

	[600, 700, 800, 900].forEach((level) => {
		response.colors[level] = darken(baseColor, intensityMap[level]);
	});

	return response as ColorPalette;
}
