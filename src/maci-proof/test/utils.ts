import fs from "fs";
import os from "os";
/**
 * Read a JSON file from disk
 * @param filePath - the path of the file
 * @returns the JSON object
 */
export const readJSONFile = async <T = Record<string, Record<string, string> | undefined>>(
  filePath: string,
): Promise<T> => {
  const isExists = fs.existsSync(filePath);

  if (!isExists) {
    throw new Error(`File ${filePath} does not exist`);
  }

  return fs.promises.readFile(filePath).then((res) => JSON.parse(res.toString()) as T);
};

/**
 * Check if we are running on an arm chip
 * @returns whether we are running on an arm chip
 */
export const isArm = (): boolean => os.arch().includes("arm");