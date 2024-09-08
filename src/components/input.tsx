import { cn } from "@/lib/utils";

interface InputProps {
  ps1: string;
  command: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  validateCommand: (command: string) => boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ({
  ps1,
  command,
  handleChange,
  handleKeyDown,
  validateCommand,
  inputRef,
}) => {
  const [commandName, ...args] = command.split(" ");

  return (
    <div className="flex flex-col">
      <label htmlFor="prompt" className="flex-shrink text-cyan-400">
        {ps1}
      </label>
      <div className="flex flex-row space-x-2">
        <span className="text-green-400">→</span>
        <div className="flex-grow relative">
          <span className={cn(validateCommand(commandName) ? "text-green-400" : "text-red-400")}>{commandName}</span>
          {args ? <span className="text-white"> {args.join(" ")}</span> : null}
          <input
            ref={inputRef}
            id="prompt"
            type="text"
            className="absolute inset-0 w-full bg-transparent outline-none text-transparent caret-white"
            value={command}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};
