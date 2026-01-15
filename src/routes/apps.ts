import { Router, Request, Response } from 'express';
import { appRepositoryService } from '../services/appRepository.js';

const router = Router();

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

function errorResponse(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}

// GET /apps - List all apps
router.get('/', async (_req: Request, res: Response) => {
  try {
    const apps = await appRepositoryService.getAllApps();
    res.json(successResponse(apps));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch apps';
    res.status(500).json(errorResponse(message));
  }
});

// GET /apps/browse - Browse apps with Handlebars view
router.get('/browse', async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const sort = (req.query.sort as string) || 'name';

    let apps = await appRepositoryService.getAllApps();

    // Filter by search
    if (search) {
      apps = apps.filter(
        (app) =>
          app.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
          app.metadata.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category) {
      apps = apps.filter((app) => app.metadata.category === category);
    }

    // Sort apps
    apps.sort((a, b) => {
      if (sort === 'name') {
        return a.metadata.name.localeCompare(b.metadata.name);
      } else if (sort === 'category') {
        return a.metadata.category.localeCompare(b.metadata.category);
      }
      return 0;
    });

    // Get unique categories
    const allApps = await appRepositoryService.getAllApps();
    const categories = [...new Set(allApps.map((app) => app.metadata.category))];

    res.render('apps/browse', {
      title: 'App Marketplace',
      apps: apps.map((app) => ({
        id: app.metadata.id,
        name: app.metadata.name,
        description: app.metadata.description,
        icon: app.metadata.icon,
        category: app.metadata.category,
        documentation: app.metadata.documentation,
        configFields: app.configuration.fields.map((field) => ({
          name: field.label,
          type: field.type,
          required: field.validation?.required || false
        })),
        volumes: app.volumes.map((vol) => `${vol.containerPath} - ${vol.description}`),
        ports: app.ports.map(
          (port) =>
            `${port.containerPort}:${port.defaultHostPort || port.containerPort}/${port.protocol}`
        ),
        resources: app.docker.restartPolicy
          ? { memory: 'Not specified', cpu: 'Not specified' }
          : null
      })),
      categories,
      search,
      category,
      sort
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch apps';
    res.render('apps/browse', {
      title: 'App Marketplace',
      apps: [],
      categories: [],
      search: '',
      category: '',
      sort: 'name',
      error: message
    });
  }
});

// GET /apps/search?q=query - Search apps
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      res.status(400).json(errorResponse('Search query parameter "q" is required'));
      return;
    }
    const apps = await appRepositoryService.searchApps(query);
    res.json(successResponse(apps));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    res.status(500).json(errorResponse(message));
  }
});

// GET /apps/category/:category - Filter by category
router.get('/category/:category', async (req: Request<{ category: string }>, res: Response) => {
  try {
    const { category } = req.params;
    const apps = await appRepositoryService.getAppsByCategory(category);
    res.json(successResponse(apps));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch apps by category';
    res.status(500).json(errorResponse(message));
  }
});

// GET /apps/:id - Get app details
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const app = await appRepositoryService.getAppById(id);
    if (!app) {
      res.status(404).json(errorResponse(`App with id "${id}" not found`));
      return;
    }
    res.json(successResponse(app));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch app';
    res.status(500).json(errorResponse(message));
  }
});

// GET /apps/:id/detail - App detail view
router.get('/:id/detail', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const app = await appRepositoryService.getAppById(id);
    if (!app) {
      res.render('apps/detail', {
        title: 'App Details',
        app: null,
        error: `App with id "${id}" not found`
      });
      return;
    }

    res.render('apps/detail', {
      title: app.metadata.name,
      app: {
        id: app.metadata.id,
        name: app.metadata.name,
        description: app.metadata.description,
        icon: app.metadata.icon,
        category: app.metadata.category,
        documentation: app.metadata.documentation,
        configFields: app.configuration.fields.map((field) => ({
          name: field.label,
          type: field.type,
          required: field.validation?.required || false
        })),
        volumes: app.volumes.map((vol) => `${vol.containerPath} - ${vol.description}`),
        ports: app.ports.map(
          (port) =>
            `${port.containerPort}:${port.defaultHostPort || port.containerPort}/${port.protocol}`
        ),
        resources: app.docker.restartPolicy
          ? { memory: 'Not specified', cpu: 'Not specified' }
          : null
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch app';
    res.render('apps/detail', {
      title: 'App Details',
      app: null,
      error: message
    });
  }
});

export default router;
