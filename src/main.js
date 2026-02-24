// Bootstrap CSS & JS (includes Popper.js)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// App-wide styles
import './styles/main.css';

// Initialize the current page module
import { initPage } from './pages/router.js';
initPage();
