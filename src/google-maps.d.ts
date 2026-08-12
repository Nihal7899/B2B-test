/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  const google: any;
  interface Window {
    google?: any;
  }
}

export {};
