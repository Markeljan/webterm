"use client";

import { useEffect, useRef } from "react";

import { History } from "@/components/history";
import { Input } from "@/components/input";
import { useTerminal } from "@/lib/hooks/use-terminal";

export const Terminal = () => {
  const { history, command, setCommand, handleChange, handleKeyDown } = useTerminal();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusInput = () => {
      const inputElement = terminalRef.current?.querySelector("input");
      inputElement?.focus();
    };

    focusInput();
    window.addEventListener("click", focusInput);

    return () => {
      window.removeEventListener("click", focusInput);
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      className="flex flex-col w-full p-8 overflow-hidden h-full border-2 rounded border-yellow-200"
    >
      <div className="flex-grow overflow-y-auto mb-4">
        <History history={history} />
        <Input command={command} setCommand={setCommand} handleChange={handleChange} handleKeyDown={handleKeyDown} />
      </div>
    </div>
  );
};
