import Docker from 'dockerode';
import type { ContainerInfo, ContainerState, DockerServiceConfig } from '../types/index.js';

class DockerService {
  private docker: Docker;
  private static instance: DockerService | null = null;

  private constructor(config: DockerServiceConfig = {}) {
    this.docker = new Docker({
      socketPath: config.socketPath || '/var/run/docker.sock'
    });
  }

  public static getInstance(config?: DockerServiceConfig): DockerService {
    if (!DockerService.instance) {
      DockerService.instance = new DockerService(config);
    }
    return DockerService.instance;
  }

  public async listContainers(all: boolean = true): Promise<ContainerInfo[]> {
    try {
      const containers = await this.docker.listContainers({ all });

      return containers.map((container) => ({
        id: container.Id.substring(0, 12),
        name: this.formatContainerName(container.Names[0] || ''),
        image: container.Image,
        status: container.Status,
        state: container.State as ContainerState
      }));
    } catch (error) {
      console.error('Failed to list containers:', error);
      throw new Error('Unable to connect to Docker daemon. Is Docker running?');
    }
  }

  public async ping(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch {
      return false;
    }
  }

  private formatContainerName(name: string): string {
    return name.startsWith('/') ? name.substring(1) : name;
  }
}

export const dockerService = DockerService.getInstance();
export default DockerService;
