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

export default router;
