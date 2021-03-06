/**
 * Offline
 */
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
OfflinePluginRuntime.install();

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js', {scope: './'})
		.catch(err => {
			// eslint-disable-next-line no-console
			console.error(err);
		});
}

/**
 * Static assets.
 */
import 'babel-polyfill';
import '../assets/css/app.scss';
import '../assets/img/logo.svg';
import './plugins/fontawesome';

/**
 * Config and routes.
 */
import config from './config';
import routes from './router/routes';

/**
 * Classes needed.
 */
import Database from './database';
import Router from './router';
import Category from './category';

/**
 * Components needed.
 */
import Sidebar from './components/sidebar';
import Search from './components/search';
import SourceModal from './components/source-add-modal';
import CategoryModal from './components/category-add-modal';
import SignUpModal from './components/signup-modal';
import LogInModal from './components/login-modal';
import Options from './components/options';
import Auth from './auth';

/**
 * Initialize database and application config.
 */
window.db = new Database();
window.app = config;

/**
 * Check if user is authenticated
 */
Auth.check();

/**
 * Render the categories saved in the sidebar.
 */
Category.all().then(categories => {
	Category.render(categories);
});

/**
 * Listen for events related to the sidebar.
 */
Sidebar.listen();

/**
 * Listen for events related with the search component.
 */
Search.listen();

/**
 * Listen for events related with the 'add source' button.
 */
SourceModal.listen();

/**
 * Listen for events related with the add category button.
 */
CategoryModal.listen();

/**
 * Listen for sign up button.
 */
SignUpModal.listen();
LogInModal.listen();

/**
 * Start the router.
 */
Router.listen(routes);

/**
 * Listen for the options.
 */
Options.listen();
