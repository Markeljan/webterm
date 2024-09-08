"use client";

import { useEffect, useRef } from "react";

import { History } from "@/components/history";
import { Input } from "@/components/input";
import { useTerminal } from "@/lib/hooks/use-terminal";

export const Terminal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  const { ps1, command, history, handleChange, handleKeyDown, validateCommand } = useTerminal();

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0 && !window.getSelection()?.toString()) {
        focusInput();
      }
    };

    document.addEventListener("click", handleMouseUp);

    focusInput();
    return () => {
      document.removeEventListener("click", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col w-full p-8 overflow-hidden h-full border-2 rounded border-yellow-200">
      <div ref={historyContainerRef} className="flex-grow overflow-y-auto mb-4">
        <History history={history} />
        <Input
          ps1={ps1}
          command={command}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          validateCommand={validateCommand}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};
