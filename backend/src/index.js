import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { startScheduler } from "./services/schedulerService.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  startScheduler();
});
