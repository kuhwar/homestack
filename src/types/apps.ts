export interface AppMetadata {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  tags: string[];
  version: string;
  maintainer?: string;
  documentation?: string;
}

export interface DockerConfig {
  image: string;
  restartPolicy: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  networkMode?: string;
  privileged?: boolean;
  capAdd?: string[];
  capDrop?: string[];
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  description?: string;
  type: 'string' | 'password' | 'number' | 'boolean' | 'select';
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  envVar: string;
  validation?: ValidationRules;
}

export interface ConfigurationSchema {
  fields: ConfigField[];
}

export interface VolumeDefinition {
  containerPath: string;
  description: string;
  required: boolean;
}

export interface PortDefinition {
  containerPort: number;
  protocol: 'tcp' | 'udp';
  description: string;
  defaultHostPort?: number;
}

export interface HealthCheckConfig {
  type: 'http' | 'tcp' | 'command';
  command?: string;
  path?: string;
  port?: number;
  interval: number;
  timeout: number;
  retries: number;
  startPeriod?: number;
}

export interface LifecycleConfig {
  preInstall?: string[];
  postInstall?: string[];
  preUninstall?: string[];
  postUninstall?: string[];
  backup?: {
    command: string;
    paths: string[];
  };
  restore?: {
    command: string;
  };
}

export interface AppDefinition {
  metadata: AppMetadata;
  docker: DockerConfig;
  configuration: ConfigurationSchema;
  volumes: VolumeDefinition[];
  ports: PortDefinition[];
  healthCheck?: HealthCheckConfig;
  lifecycle?: LifecycleConfig;
}

export interface AppInstance {
  id: string;
  appId: string;
  name: string;
  containerId?: string;
  status: 'installing' | 'running' | 'stopped' | 'error' | 'updating';
  config: Record<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}
