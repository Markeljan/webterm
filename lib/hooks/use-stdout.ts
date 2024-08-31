import { useState, useCallback } from "react";

export const useStdOut = (initialOutput: string[] = []) => {
  const [output, setOutput] = useState<string[]>(initialOutput);

  const addOutput = useCallback((newOutput: string) => {
    setOutput((prev) => [...prev, newOutput]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    output,
    addOutput,
    clearOutput,
  };
};
