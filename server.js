import dotenv from 'dotenv';
// 💡 FIX: Use import instead of require, and specify the file path correctly
import app from './src/app.js'; 

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sudanese American Society server running on port ${PORT}`);
});
