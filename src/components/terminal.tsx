"use client";

import { useEffect, useRef, useState } from "react";

import { History } from "@/components/history";
import { Input } from "@/components/input";
import { useFhenix } from "@/lib/hooks/use-fhenix";
import { useTerminal } from "@/lib/hooks/use-terminal";

export const Terminal = () => {
  const { history, command, setCommand, handleChange, handleKeyDown } = useTerminal();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [encryptedString, setEncryptedString] = useState<any[]>([]);
  const { encryptString, addPost, unsealPostLength } = useFhenix();

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
        <button
          onClick={async () => {
            const res = await encryptString("mark");
            if (res) {
              setEncryptedString(res);
            }
          }}
        >
          Encrypt
        </button>
        <button
          onClick={async () => {
            await addPost(encryptedString);
          }}
        >
          Add Post
        </button>
        <button
          onClick={async () => {
            const res = await unsealPostLength();
            if (res) {
              console.log(res);
            }
          }}
        >
          Unseal Post Length
        </button>
      </div>
    </div>
  );
};
