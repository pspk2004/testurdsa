import { TestCase, RunResult } from '../types';

interface ExecutionResult {
    passed: boolean;
    actual: string;
}

// Simple parser for test case inputs. E.g., "nums = [2,7,11,15], target = 9"
// This is a simplified parser and might not cover all edge cases.
const parseInput = (input: string): any[] => {
    const assignments = input.split(/,(?=\s*\w+\s*=)/); // Split by comma only if followed by 'word ='
    const args: any[] = [];
    
    // Regex to find the function signature to determine argument order
    // This is a simplification; a more robust solution would be needed for complex signatures.
    // Let's assume the order in the input string matches the function signature.

    for (const assignment of assignments) {
        const parts = assignment.trim().split('=');
        const value = parts[1].trim();
        try {
            // Use Function constructor for safe evaluation of literals
            const parsedValue = new Function(`return ${value}`)();
            args.push(parsedValue);
        } catch (e) {
            console.error(`Failed to parse input value: ${value}`, e);
            args.push(undefined); // Push undefined if parsing fails
        }
    }
    return args;
};


// Extracts function name from starter code
const getFunctionName = (code: string): string | null => {
    // Matches "var twoSum = function" or "function twoSum"
    const match = code.match(/(?:var|let|const)\s+([a-zA-Z0-9_]+)\s*=\s*function|function\s+([a-zA-Z0-9_]+)\s*\(/);
    return match ? match[1] || match[2] : null;
};

// We will use a simple in-page "worker" via a Blob URL for simplicity,
// avoiding the need for a separate worker file.
const workerCode = `
    self.onmessage = (event) => {
        const { code, testCases } = event.data;

        const getFunctionName = (c) => {
            const match = c.match(/(?:var|let|const)\\s+([a-zA-Z0-9_]+)\\s*=\\s*function|function\\s+([a-zA-Z0-9_]+)\\s*\\(/);
            return match ? match[1] || match[2] : null;
        };
        
        const parseInput = (input) => {
            const assignments = input.split(/,(?=\\s*\\w+\\s*=)/);
            const args = [];
            for (const assignment of assignments) {
                const parts = assignment.trim().split('=');
                const value = parts[1].trim();
                try {
                    const parsedValue = new Function(\`return \${value}\`)();
                    args.push(parsedValue);
                } catch (e) {
                    args.push(undefined);
                }
            }
            return args;
        };

        const functionName = getFunctionName(code);
        if (!functionName) {
            postMessage({ error: 'Could not identify the function name in your code.' });
            return;
        }

        try {
            // Create the function from the user's code
            const userFunc = new Function(\`\${code}; return \${functionName};\`)();

            if (typeof userFunc !== 'function') {
                postMessage({ error: \`'\${functionName}' is not a function. Make sure your code defines it correctly.\` });
                return;
            }

            const results = testCases.map(tc => {
                try {
                    const args = parseInput(tc.input);
                    const actualRaw = userFunc(...args);
                    const actual = JSON.stringify(actualRaw);
                    const expected = JSON.stringify(new Function(\`return \${tc.output}\`)());
                    
                    // A simple sort for array comparison to handle cases like [0,1] vs [1,0]
                    const sortedActual = Array.isArray(actualRaw) ? JSON.stringify(actualRaw.slice().sort()) : actual;
                    const sortedExpected = Array.isArray(JSON.parse(expected)) ? JSON.stringify(JSON.parse(expected).slice().sort()) : expected;

                    return {
                        passed: sortedActual === sortedExpected,
                        actual: actual,
                    };
                } catch (e) {
                    return {
                        passed: false,
                        actual: e.message,
                    };
                }
            });
            postMessage({ results });

        } catch (e) {
             postMessage({ error: e.message });
        }
    };
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);


export const executeJavaScript = (code: string, testCases: Pick<TestCase, 'input' | 'output'>[]): Promise<ExecutionResult[]> => {
  return new Promise((resolve) => {
    const worker = new Worker(workerUrl);

    const timeout = setTimeout(() => {
        worker.terminate();
        resolve(testCases.map(() => ({ passed: false, actual: 'Execution timed out. Check for infinite loops.' })));
    }, 5000); // 5-second timeout

    worker.onmessage = (event) => {
        clearTimeout(timeout);
        worker.terminate();
        if (event.data.error) {
             resolve(testCases.map(() => ({ passed: false, actual: event.data.error })));
        } else {
            resolve(event.data.results);
        }
    };

    worker.onerror = (event) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve(testCases.map(() => ({ passed: false, actual: `Execution error: ${event.message}` })));
    };

    worker.postMessage({ code, testCases });
  });
};
