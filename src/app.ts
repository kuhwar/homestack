import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();

// Handlebars setup
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(rootDir, 'views', 'layouts'),
  partialsDir: path.join(rootDir, 'views', 'partials'),
  helpers: {
    eq: (a: unknown, b: unknown) => a === b,
    statusClass: (state: string) => {
      const stateClasses: Record<string, string> = {
        running: 'status-running',
        paused: 'status-paused',
        restarting: 'status-restarting',
        exited: 'status-stopped',
        created: 'status-stopped',
        dead: 'status-stopped',
        removing: 'status-stopped'
      };
      return stateClasses[state] || 'status-stopped';
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(rootDir, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));

// Routes
app.use('/', routes);

export default app;
