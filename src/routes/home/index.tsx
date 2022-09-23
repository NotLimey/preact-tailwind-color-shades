import { h } from 'preact';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ntc } from '@cosmicice/namethatcolor';
import toast from 'react-hot-toast';

const Home = () => {
	const [color, setColor] = useState('');
	const [generatedColors, setGeneratedColors] = useState<ColorPalette[]>([]);
	const [exportText, setExport] = useState('');

	const handleEnter = () => {
		// get color but remove all # and spaces
		if (color.length === 0) {
			return toast.error('Please enter a color');
		}
		const newColor = color.replace(/#/g, '').replace(/ /g, '');
		if (!isHexColor(newColor)) {
			return toast.error('Please enter a valid hex color');
		}
		const colors = generateColors(newColor);
		if (colors) {
			setGeneratedColors((prev) => [...prev, colors]);
			toast('Color palette generated!', {
				icon: '🎨',
			});
			setColor('');
		}
	};

	const handleCopy = async (color: string) => {
		if (navigator.clipboard && window.isSecureContext) {
			// navigator clipboard api method'
			return navigator.clipboard
				.writeText(color)
				.then((res) => {
					const responseText =
						color.length < 10
							? `Copied ${color} to clipboard`
							: 'Copied to clipboard';
					if (color.length === 7 && color.includes('#')) {
						toast(() => (
							<div className='flex gap-x-2 items-center'>
								<div
									className='h-5 w-5 rounded'
									style={{ backgroundColor: color }}
								/>
								{responseText}
							</div>
						));
					} else {
						toast(responseText, {
							icon: '👍',
						});
					}
					return res;
				})
				.catch((err) => {
					toast('Failed to copy to clipboard!', {
						icon: '👎',
					});
					return err;
				});
		}
		const textArea = document.createElement('textarea');
		textArea.value = color;
		// make the textarea out of viewport
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		return new Promise((res, rej) => {
			// here the magic happens
			const execRes = document.execCommand('copy');
			if (execRes) {
				res('success');
				const responseText =
					color.length < 10
						? `Copied ${color} to clipboard`
						: 'Copied to clipboard';
				if (color.length === 7 && color.includes('#')) {
					toast(() => (
						<div className='flex gap-x-2 items-center'>
							<div
								className='h-5 w-5 rounded'
								style={{ backgroundColor: color }}
							/>
							{responseText}
						</div>
					));
				} else {
					toast(responseText, {
						icon: '👍',
					});
				}
			} else {
				rej('failed');
				toast('Failed to copy to clipboard!', {
					icon: '👎',
				});
			}
			textArea.remove();
		});
	};

	const handleExport = (copy = false) => {
		const exportColors = generatedColors.reduce((acc: any, curr) => {
			acc[curr.name] = curr.colors;
			return acc;
		}, {});
		const output = JSON.stringify(exportColors, null, 4);
		setExport(output);
		if (copy) {
			handleCopy(output);
		}
	};

	return (
		<div className='w-full px-5 min-h-screen max-w-full flex flex-col justify-between'>
			<div className='max-w-6xl mx-auto my-24 w-full'>
				<h1 className='text-2xl text-center font-bold lg:text-4xl'>
					Tailwind color shades generator
				</h1>
				<p className=' mb-12 text-gray-500 mt-1 text-center'>
					Create shades of color that works perfectly with{' '}
					<code className='bg-gray-100 px-1 py-0.5 rounded-md text-sm text-gray-600'>
						Tailwindcss
					</code>
				</p>
				<div className='mx-auto max-w-xl flex justify-center mb-8 items-center'>
					<input
						type='text'
						className='bg-white border-gray-300 border rounded-md shadow-sm py-1.5 px-3 w-full'
						onInput={(e) => setColor(e.currentTarget.value)}
						placeholder='Enter a hex color'
						value={color}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleEnter();
							}
						}}
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
								className='grid grid-cols-11 grid-rows-1 gap-x-1'>
								{Object.keys(color.colors).map(
									(hex: string, idx: number) => (
										<div
											key={idx}
											className='flex flex-col'>
											<div
												className='w-full h-full aspect-square border rounded-md overflow-hidden'
												style={{
													backgroundColor:
														color.colors[hex],
												}}>
												<div
													className='w-full h-full opacity-0 bg-black/30 hover:opacity-100 flex justify-center items-center text-white font-mono uppercase cursor-pointer'
													onClick={() =>
														handleCopy(
															color.colors[hex]
														)
													}>
													{color.colors[hex]}
												</div>
											</div>
											<p className='text-center text-xs sm:text-sm md:text-base font-mono text-gray-700 py-2'>
												{hex}
											</p>
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
											toast('Color removed', {
												icon: '🗑️',
											});
										}}
										className='inline-flex items-center rounded-full border border-transparent bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>
										<XMarkIcon
											className='h-4 w-4'
											strokeWidth={2}
											aria-hidden='true'
										/>
									</button>
								</div>
							</div>
						))}
				</div>
				{generatedColors.length > 0 && (
					<div className='flex justify-center items-center mt-5'>
						<button
							type='button'
							onClick={() => handleExport()}
							className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
							Export
						</button>
						<button
							type='button'
							onClick={() => handleExport(true)}
							className='inline-flex ml-3 items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
							Copy tailwind config
						</button>
					</div>
				)}
				{exportText.length > 0 && (
					<div className='mt-5 bg-gray-100 rounded-md px-4 py-2 font-mono'>
						{/* Show json string pretty */}
						<pre>{exportText}</pre>
					</div>
				)}
			</div>
			<div className='text-center py-6'>
				<a
					className='text-base text-blue-500 hover:text-blue-600 mb-3 inline-flex justify-center items-center gap-x-2'
					href='https://github.com/NotLimey/preact-tailwind-color-shades'
					target='_blank'
					rel='noreferrer'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						style='fill: rgba(0, 0, 0, 1);transform: ;msFilter:;'>
						<path
							fill-rule='evenodd'
							clip-rule='evenodd'
							d='M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z'
						/>
					</svg>
					Github repo
				</a>
				<p>
					Made with ❤️ by{' '}
					<a
						className='text-blue-500 hover:text-blue-600'
						target='_blank'
						rel='noreferrer'
						href='https://github.com/notlimey'>
						Notlimey
					</a>
				</p>
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
	const col = ntc.name(`#${color.replace('##', '#')}`);
	const sanitizedName = col.name
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

function isHexColor(hex: string) {
	return (
		typeof hex === 'string' &&
		hex.length === 6 &&
		!isNaN(Number(`0x${hex}`))
	);
}
