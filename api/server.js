import dotenv from 'dotenv';
import app from './src/app.js'; 

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sudanese American Society server running on port ${PORT}`);
});
