import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function MarkdownRender({
  content = "",
  textOnly = false,
}: {
  content?: string;
  textOnly?: boolean;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h1 className="text-4xl font-bold my-4" {...props} />
          ),
        h2: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h2 className="text-3xl font-semibold my-3" {...props} />
          ),
        h3: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h3 className="text-2xl font-semibold my-2" {...props} />
          ),
        h4: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h4 className="text-xl font-semibold my-2" {...props} />
          ),
        h5: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h5 className="text-lg font-semibold my-2" {...props} />
          ),
        h6: (props) =>
          textOnly ? (
            props.children
          ) : (
            <h6 className="text-base font-semibold my-2" {...props} />
          ),
        p: (props) =>
          textOnly ? props.children : <p className="my-2" {...props} />,
        strong: (props) =>
          textOnly ? (
            props.children
          ) : (
            <strong className="font-bold" {...props} />
          ),
        em: (props) =>
          textOnly ? props.children : <em className="italic" {...props} />,
        del: (props) =>
          textOnly ? (
            props.children
          ) : (
            <del className="line-through" {...props} />
          ),
        blockquote: (props) =>
          textOnly ? (
            props.children
          ) : (
            <blockquote
              className="border-l-4 border-gray-200 pl-4 italic my-2"
              {...props}
            />
          ),
        ul: (props) =>
          textOnly ? (
            props.children
          ) : (
            <ul className="list-disc ps-[20px] my-2" {...props} />
          ),
        ol: (props) =>
          textOnly ? (
            props.children
          ) : (
            <ol className="list-decimal ps-[20px] my-2" {...props} />
          ),
        li: (props) =>
          textOnly ? props.children : <li className="my-1" {...props} />,
        code: (props) =>
          textOnly ? (
            props.children
          ) : (
            <code className="rounded px-1 font-mono" {...props} />
          ),
        pre: (props) =>
          textOnly ? (
            props.children
          ) : (
            <pre
              className="bg-gray-100 text-foreground rounded p-2 overflow-x-auto"
              {...props}
            />
          ),
        a: (props) =>
          textOnly ? (
            props.children
          ) : (
            <a className="underline font-semibold" {...props} />
          ),
        img: (props) =>
          textOnly ? (
            props.children
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="max-w-full h-auto" {...props} />
          ),
      }}
    >
      {content}
    </Markdown>
  );
}
