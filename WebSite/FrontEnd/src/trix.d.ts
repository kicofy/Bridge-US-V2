import type * as React from 'react';

declare module 'trix';
declare module 'trix/dist/trix.css';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'trix-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        input?: string;
        placeholder?: string;
      };
      'trix-toolbar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};
