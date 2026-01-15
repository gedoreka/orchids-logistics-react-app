import { query } from "./src/lib/db";

async function main() {
  try {
    const results = await query<any>("DESCRIBE sales_invoices");
    console.log(results.map((r: any) => r.Field).join(", "));
  } catch (error) {
    console.error(error);
  }
}

main();
