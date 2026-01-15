import { query } from "./src/lib/db";

async function main() {
  try {
    const columns = await query<any>("SHOW COLUMNS FROM sales_invoices");
    console.log(JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error(error);
  }
}

main();
