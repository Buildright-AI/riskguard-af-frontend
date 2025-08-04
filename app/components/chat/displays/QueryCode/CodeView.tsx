"use client";

import { ResultPayload } from "@/app/types/chat";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import CopyToClipboardButton from "@/app/components/navigation/CopyButton";
import { IoClose } from "react-icons/io5";
import { FaTable } from "react-icons/fa";
import { useContext } from "react";
import { RouterContext } from "@/app/components/contexts/RouterContext";
import { FaCode } from "react-icons/fa6";

interface CodeDisplayProps {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  payload: ResultPayload[];
  handleViewChange: (
    view: "chat" | "code" | "result",
    payload: ResultPayload[] | null
  ) => void;
}

const CodeView: React.FC<CodeDisplayProps> = ({
  payload,
  handleViewChange,
}) => {
  const { changePage } = useContext(RouterContext);

  if (!payload) return null;

  const routerChangeCollection = (collectionName: string) => {
    changePage("collection", { source: collectionName }, true);
  };

  return (
    <div className="flex flex-col gap-6 overflow-hidden chat-animation">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <p>Source Code</p>
        </div>
        <Button
          variant={"ghost"}
          className="text-secondary h-9 w-9"
          onClick={() => handleViewChange("chat", null)}
        >
          <IoClose size={12} />
        </Button>
      </div>
      {payload.map((item, index) => (
        <div key={index} className="w-full">
          <div className="flex justify-start items-center w-full">
            <div className="flex gap-2 items-center w-full">
              {payload[0].metadata.collection_name && (
                <div className="flex flex-row justify-between items-center w-full">
                  <div className="flex gap-2 justify-start items-center">
                    <div className="text-highlight bg-highlight/10 h-9 w-9 rounded-md flex items-center justify-center">
                      <FaCode size={14} className="text-highlight" />
                    </div>
                    {item.metadata.collection_name}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-y-scroll">
              <div className="absolute top-2 right-0 p-3 flex gap-1">
                <Button
                  className="bg-accent/10 hover:bg-accent/20 h-9 w-9"
                  onClick={() =>
                    routerChangeCollection(item.metadata.collection_name)
                  }
                >
                  <FaTable size={14} className="text-accent" />
                </Button>
                <CopyToClipboardButton copyText={item.metadata.code.text} />
              </div>
              <SyntaxHighlighter
                language={item.metadata.code.language}
                wrapLongLines={true}
                showLineNumbers={true}
                style={oneDark}
                customStyle={{
                  backgroundColor: "#202020",
                  color: "#f2f2f2",
                  width: "100%",
                  maxHeight: "calc(70vh - 2rem)",
                }}
                className="rounded-lg overflow-y-scroll"
              >
                {item.metadata.code.text}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CodeView;
