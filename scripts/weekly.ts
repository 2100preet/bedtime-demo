import "dotenv/config";
import { runWeeklyJob } from "../src/lib/jobs/weekly";

runWeeklyJob()
  .then((report) => {
    console.log(report);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
