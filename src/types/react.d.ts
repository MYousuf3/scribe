declare module 'react' {
  export = React;
  export as namespace React;
  namespace React {
    // Basic React types
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    type ReactNode = ReactElement | string | number | boolean | null | undefined;
    type Key = string | number;
    type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<P, any>);
    
    class Component<P = {}, S = {}> {
      props: Readonly<P>;
      state: Readonly<S>;
    }
    
    function createElement<P extends {}>(
      type: string | JSXElementConstructor<P>,
      props?: P | null,
      ...children: ReactNode[]
    ): ReactElement<P>;
  }
} 