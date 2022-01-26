import { useContext, NestContext } from '../context';

declare module '@modern-js/runtime/server' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export function useContext(): NestContext;
}

export { useContext };
