import { Router, Request, Response } from 'express';
import { dockerService } from '../services/docker.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const containers = await dockerService.listContainers();
    const dockerConnected = await dockerService.ping();

    res.render('home', {
      title: 'Homestack',
      containers,
      dockerConnected,
      containerCount: containers.length
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.render('home', {
      title: 'Homestack',
      containers: [],
      dockerConnected: false,
      error: errorMessage,
      containerCount: 0
    });
  }
});

export default router;
