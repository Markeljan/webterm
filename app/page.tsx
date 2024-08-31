"use client";

import { useCallback, useEffect, useRef } from "react";

import { History } from "@/components/history";
import { Input } from "@/components/input";
import { BANNER } from "@/lib/commands";
import { useHistory } from "@/lib/hooks/use-history";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { history, command, lastCommandIndex, setCommand, setHistory, clearHistory, setLastCommandIndex } = useHistory(
    []
  );

  const init = useCallback(() => {
    setHistory(BANNER);
  }, [setHistory]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView();
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  const onClickAnywhere = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="p-8 overflow-hidden h-full border-2 rounded border-yellow-200"
      onClick={onClickAnywhere}
    >
      <div ref={containerRef} className="overflow-y-auto h-full">
        <History history={history} />
        <Input
          inputRef={inputRef}
          containerRef={containerRef}
          command={command}
          history={history}
          lastCommandIndex={lastCommandIndex}
          setCommand={setCommand}
          setHistory={setHistory}
          setLastCommandIndex={setLastCommandIndex}
          clearHistory={clearHistory}
        />
      </div>
    </div>
  );
}
