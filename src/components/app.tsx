import { h } from 'preact';
import { Route, Router } from 'preact-router';
import { useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';

const App = () => {
	const { toasts } = useToasterStore();

	useEffect(() => {
		toasts
			.filter((t) => t.visible) // Only consider visible toasts
			.filter((_, i) => i >= 3) // Is toast index over limit?
			.forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) for no exit animation
	}, [toasts]);

	return (
		<div id='app'>
			<Toaster
				position='top-center'
				reverseOrder={false}
				toastOptions={{}}
			/>
			<Router>
				<Route path='/' component={Home} />
			</Router>
		</div>
	);
};

export default App;
