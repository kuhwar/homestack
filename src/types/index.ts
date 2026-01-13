export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: ContainerState;
}

export type ContainerState =
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'created'
  | 'dead';

export interface DockerServiceConfig {
  socketPath?: string;
}

export interface AppConfig {
  port: number;
  host: string;
}
