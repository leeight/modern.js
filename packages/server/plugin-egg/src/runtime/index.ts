import { useContext, Context } from '../context';

declare module '@modern-js/runtime/server' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export function useContext(): Context;
}

export { useContext };
