// environment.d.ts
interface Environment_Var {
  API_URL: string;
  PROJECT_TITLE: string;
  USE_SSO: boolean;
}

declare global {
  interface Window {
    _env_: Environment_Var;
  }
}

export {};
