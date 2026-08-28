import dotenv from 'dotenv';
import app from './src/app.js'; 
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Initialize environment variables
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, "../.env") });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sudanese American Society server running on port ${PORT}`);
});
