// Global custom event typings for the docs app
declare global {
  interface WindowEventMap {
    'docs:toggle-sidebar': CustomEvent<void>;
  }
}

export {};

