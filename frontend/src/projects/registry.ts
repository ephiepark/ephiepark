import { Project, ProjectRegistration } from '../types/project';

class ProjectRegistry {
  private projects: Map<string, Project> = new Map();
  private registrations: Map<string, ProjectRegistration> = new Map();

  async registerProject(id: string, registration: ProjectRegistration): Promise<void> {
    if (this.registrations.has(id)) {
      throw new Error(`Project with id ${id} is already registered`);
    }

    this.registrations.set(id, registration);
    
    // Initialize the project
    await registration.initialize();
    
    // Create the project instance
    const metrics = await registration.getMetrics();
    const project: Project = {
      id,
      config: registration.config,
      metrics,
    };

    this.projects.set(id, project);
  }

  unregisterProject(id: string): void {
    this.projects.delete(id);
    this.registrations.delete(id);
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getProjectComponent(id: string): React.ComponentType | undefined {
    const registration = this.registrations.get(id);
    return registration?.Component;
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  async refreshProjectMetrics(id: string): Promise<void> {
    const registration = this.registrations.get(id);
    const project = this.projects.get(id);
    
    if (!registration || !project) {
      throw new Error(`Project with id ${id} not found`);
    }

    const metrics = await registration.getMetrics();
    project.metrics = metrics;
    this.projects.set(id, project);
  }
}

// Create and export a singleton instance
export const projectRegistry = new ProjectRegistry();
