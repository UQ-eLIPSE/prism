// environment.d.ts
interface Environment_Var {
  API_URL: string;
  PROJECT_TITLE: string;
}

declare global {
  interface Window {
    _env_: Environment_Var;
  }
}

export {};
