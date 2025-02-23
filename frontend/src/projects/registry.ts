import { Project } from '../types/project';
import { projectsConfig } from './config';

class ProjectRegistry {
  private projects: Map<string, Project> = new Map(
    Object.entries(projectsConfig).map(([id, config]) => [
      id,
      {
        id,
        config: config.config,
        initializationStatus: 'pending'
      }
    ])
  );

  async initializeAllProjects(): Promise<void> {
    const initPromises = Object.entries(projectsConfig).map(async ([id, config]) => {
      try {
        await config.initialize();
        const project = this.projects.get(id)!;
        project.initializationStatus = 'completed';
        this.projects.set(id, project);
      } catch (error) {
        console.error(`Failed to initialize project ${id}:`, error);
        // Keep project in pending state to show it failed
      }
    });

    await Promise.all(initPromises);
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getProjectComponent(id: string): React.ComponentType | undefined {
    return projectsConfig[id]?.Component;
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }
}

// Create and export a singleton instance
export const projectRegistry = new ProjectRegistry();
