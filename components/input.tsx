import { config } from "@/app/config";
import { shell } from "@/lib/shell";
import { handleTabCompletion } from "@/lib/tab-completions";

interface InputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  command: string;
  history: string[];
  lastCommandIndex: number;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
  setHistory: (value: string) => void;
  setLastCommandIndex: React.Dispatch<React.SetStateAction<number>>;
  clearHistory: () => void;
}

export const Input: React.FC<InputProps> = ({
  inputRef,
  containerRef,
  command,
  history,
  lastCommandIndex,
  setCommand,
  setHistory,
  setLastCommandIndex,
  clearHistory,
}) => {
  const onSubmit = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.code === "13") {
      setHistory(`command: ${command}`);
      await shell(command, setHistory, clearHistory, setCommand);
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
      setLastCommandIndex(0);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(event.target.value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      if (lastCommandIndex < history.length) {
        setCommand(history[history.length - 1 - lastCommandIndex]);
        setLastCommandIndex(lastCommandIndex + 1);
      }
    } else if (event.key === "ArrowDown") {
      if (lastCommandIndex > 0) {
        setCommand(history[history.length - lastCommandIndex + 1]);
        setLastCommandIndex(lastCommandIndex - 1);
      } else {
        setCommand("");
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      handleTabCompletion(command, setCommand);
    }
  };

  return (
    <div className="flex flex-row space-x-2">
      <label htmlFor="prompt" className="flex-shrink">
        {config.ps1_username}
        <span className="text-yellow-200">@</span>
        {config.ps1_hostname}
        <span className="text-yellow-200">:$ ~ </span>
      </label>
      <input
        ref={inputRef}
        id="prompt"
        type="text"
        className="flex-grow bg-transparent outline-none"
        value={command}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onKeyUp={onSubmit}
        autoComplete="off"
      />
    </div>
  );
};
