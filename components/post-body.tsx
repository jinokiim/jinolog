import { useEffect } from "react";
import markdownStyles from "./markdown-styles.module.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // 원하는 스타일을 가져옵니다.

type Props = {
  content: string;
};

const PostBody = ({ content }: Props) => {
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block as HTMLElement);
      (block as HTMLElement).style.backgroundColor = "#e9e9e9";
      (block as HTMLElement).style.fontSize = "14px";
    });
  }, [content]);
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={markdownStyles.markdown}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default PostBody;
