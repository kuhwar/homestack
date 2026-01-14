import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { AppDefinition } from '../types/apps.js';

export interface AppRepositoryConfig {
  repositoryPath?: string;
}

class AppRepositoryService {
  private static instance: AppRepositoryService | null = null;
  private cache: Map<string, AppDefinition> = new Map();
  private repositoryPath: string;
  private loaded: boolean = false;

  private constructor(config: AppRepositoryConfig = {}) {
    this.repositoryPath = config.repositoryPath || join(process.cwd(), 'apps', 'repository');
  }

  public static getInstance(config?: AppRepositoryConfig): AppRepositoryService {
    if (!AppRepositoryService.instance) {
      AppRepositoryService.instance = new AppRepositoryService(config);
    }
    return AppRepositoryService.instance;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadRepository();
    }
  }

  private async loadRepository(): Promise<void> {
    try {
      const files = await readdir(this.repositoryPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const filePath = join(this.repositoryPath, file);
          const content = await readFile(filePath, 'utf-8');
          const appDefinition = JSON.parse(content) as AppDefinition;

          if (this.isValidAppDefinition(appDefinition)) {
            this.cache.set(appDefinition.metadata.id, appDefinition);
          } else {
            console.warn(`Invalid app definition in ${file}: missing required fields`);
          }
        } catch (error) {
          console.error(`Failed to load app definition from ${file}:`, error);
        }
      }

      this.loaded = true;
    } catch (error) {
      console.error('Failed to load app repository:', error);
      throw new Error(`Unable to load app repository from ${this.repositoryPath}`);
    }
  }

  private isValidAppDefinition(app: unknown): app is AppDefinition {
    if (!app || typeof app !== 'object') return false;
    const def = app as Record<string, unknown>;

    return (
      typeof def.metadata === 'object' &&
      def.metadata !== null &&
      typeof (def.metadata as Record<string, unknown>).id === 'string' &&
      typeof (def.metadata as Record<string, unknown>).name === 'string' &&
      typeof def.docker === 'object' &&
      def.docker !== null &&
      typeof def.configuration === 'object' &&
      def.configuration !== null
    );
  }

  public async getAllApps(): Promise<AppDefinition[]> {
    await this.ensureLoaded();
    return Array.from(this.cache.values());
  }

  public async getAppById(id: string): Promise<AppDefinition | null> {
    await this.ensureLoaded();
    return this.cache.get(id) || null;
  }

  public async getAppsByCategory(category: string): Promise<AppDefinition[]> {
    await this.ensureLoaded();
    return Array.from(this.cache.values()).filter(
      app => app.metadata.category.toLowerCase() === category.toLowerCase()
    );
  }

  public async searchApps(query: string): Promise<AppDefinition[]> {
    await this.ensureLoaded();
    const lowerQuery = query.toLowerCase();

    return Array.from(this.cache.values()).filter(app => {
      const { name, description, tags } = app.metadata;

      return (
        name.toLowerCase().includes(lowerQuery) ||
        description.toLowerCase().includes(lowerQuery) ||
        tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  public async reloadRepository(): Promise<void> {
    this.cache.clear();
    this.loaded = false;
    await this.loadRepository();
  }
}

export const appRepositoryService = AppRepositoryService.getInstance();
export default AppRepositoryService;
