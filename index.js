import 'dotenv/config';

import { connectDB } from "./db/db.config.js";
import app from './app.js';
const port = process.env.PORT || 3000

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`App is listening on port ${port}`)
    })
})
.catch((err) => {
    console.error("Database connection error", err);
    process.exit(1);
  });
