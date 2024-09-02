"use client";

import { useEffect, useRef } from "react";

import { isValidCommand } from "@/lib/commands";
import { terminalConfig } from "@/lib/config";

interface InputProps {
  command: string;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({ command, handleChange, handleKeyDown }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const parts = command.split(/\s+/);
  const commandPart = parts[0];
  const argsPart = parts.slice(1).join(" ");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-row space-x-2">
      <label htmlFor="prompt" className="flex-shrink text-cyan-400">
        {`${terminalConfig.ps1_username}@${terminalConfig.ps1_hostname}:$ ~ `}
      </label>
      <div className="flex-grow relative">
        <span className={isValidCommand(commandPart) ? "text-green-400" : "text-red-400"}>{commandPart}</span>
        <span className="text-white">{argsPart ? ` ${argsPart}` : ""}</span>
        <input
          ref={inputRef}
          id="prompt"
          type="text"
          className="absolute inset-0 w-full bg-transparent outline-none caret-white text-transparent"
          value={command}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
