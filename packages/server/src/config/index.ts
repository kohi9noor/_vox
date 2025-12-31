import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findWorkspaceRoot(startDir: string): string {
  let current = startDir;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'nx.json'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.resolve(
    __dirname,
    __dirname.includes('dist') ? '../../..' : '../../../..'
  );
}

const ROOT_DIR = findWorkspaceRoot(__dirname);

export const config = {
  server: {
    port: parseInt(process.env.PORT || '8080'),
  },

  python: {
    timeout: parseInt(process.env.PYTHON_TIMEOUT || '300000'),
  },

  models: {
    xtts: {
      pythonBin:
        process.env.XTTS_PYTHON_BIN ||
        path.join(ROOT_DIR, 'models/xtts-v2/.venv/bin/python'),
      pythonScript:
        process.env.XTTS_PYTHON_SCRIPT ||
        path.join(ROOT_DIR, 'models/xtts-v2/inference.py'),
    },
    seedvc: {
      pythonBin:
        process.env.SEEDVC_PYTHON_BIN ||
        path.join(ROOT_DIR, 'models/seed-vc/.venv/bin/python'),
      pythonScript:
        process.env.SEEDVC_PYTHON_SCRIPT ||
        path.join(ROOT_DIR, 'models/seed-vc/inference_v2.py'),
    },
    makeanaudio: {
      pythonBin:
        process.env.MAKEANAUDIO_PYTHON_BIN ||
        path.join(ROOT_DIR, 'models/make-an-audio/.venv/bin/python'),
      pythonScript:
        process.env.MAKEANAUDIO_PYTHON_SCRIPT ||
        path.join(ROOT_DIR, 'models/make-an-audio/gen_wav.py'),
    },
  },

  storage: {
    targetDir: path.join(ROOT_DIR, 'data/target'),
    uploadsDir: path.join(ROOT_DIR, 'data/target/uploads'),
    outputDir: path.join(ROOT_DIR, 'data/output'),
  },
};
