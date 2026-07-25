import toolManifest from "./tools.json";

export type AppDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  packageName: string;
  componentName: string;
};

const apps: AppDefinition[] = toolManifest;

export default apps;
