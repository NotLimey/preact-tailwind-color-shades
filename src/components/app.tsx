import { h } from 'preact';
import { Route, Router } from 'preact-router';
import { Toaster } from 'react-hot-toast';

// Code-splitting is automated for `routes` directory
import Home from '../routes/home';

const App = () => (
	<div id='app'>
		<Toaster position='top-center' reverseOrder={false} />
		<Router>
			<Route path='/' component={Home} />
		</Router>
	</div>
);

export default App;
