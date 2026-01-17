import { Highlight, themes } from 'prism-react-renderer';
import { cn } from '@/lib/utils';

export type CodeBlockProps = {
  /** Source code rendered inside the block. */
  code: string;
  /** Language token used for Prism syntax highlighting. */
  language?: string;
  /** Additional classes merged into the wrapping <pre>. */
  className?: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const lang = language ?? 'ts';

  return (
    <Highlight code={code} language={lang} theme={themes.nightOwl}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(
            'w-full max-w-full overflow-x-auto rounded-md border bg-zinc-50 p-4 text-sm dark:bg-zinc-900',
            className,
          )}
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, index) => {
            const lineProps = getLineProps({ line });
            return (
              <div
                key={`${line}-${index}`}
                {...lineProps}
                className={cn(
                  'px-2 -mx-2 rounded-sm whitespace-pre',
                  lineProps.className,
                )}
              >
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token });
                  return <span key={key} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}
