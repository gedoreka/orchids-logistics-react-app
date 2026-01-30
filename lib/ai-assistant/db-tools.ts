import { query } from '@/lib/db';

export async function searchEmployee(searchTerm: string) {
  try {
    const results = await query<any>(
      `SELECT e.*, p.name as package_name 
       FROM employees e 
       LEFT JOIN packages p ON e.package_id = p.id
       WHERE e.iqama_number = ? OR e.name LIKE ? OR e.user_code = ?`,
      [searchTerm, `%${searchTerm}%`, searchTerm]
    );
    return results;
  } catch (error) {
    console.error('Search Employee Error:', error);
    return [];
  }
}

export async function searchInvoice(invoiceNumber: string) {
  try {
    const results = await query<any>(
      `SELECT * FROM sales_invoices WHERE invoice_number = ?`,
      [invoiceNumber]
    );
    return results;
  } catch (error) {
    console.error('Search Invoice Error:', error);
    return [];
  }
}

export async function searchVehicle(searchTerm: string) {
  try {
    const results = await query<any>(
      `SELECT * FROM vehicles 
       WHERE plate_number_ar = ? OR plate_number_en = ? OR chassis_number = ? OR owner_id_number = ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    return results;
  } catch (error) {
    console.error('Search Vehicle Error:', error);
    return [];
  }
}

export async function searchCreditNote(noteNumber: string) {
  try {
    const results = await query<any>(
      `SELECT * FROM credit_notes WHERE credit_note_number = ?`,
      [noteNumber]
    );
    return results;
  } catch (error) {
    console.error('Search Credit Note Error:', error);
    return [];
  }
}

export async function searchVoucher(voucherNumber: string) {
  try {
    // Search in both receipt_vouchers and promissory_notes
    const receipts = await query<any>(
      `SELECT *, 'receipt' as type FROM receipt_vouchers WHERE receipt_number = ?`,
      [voucherNumber]
    );
    const promissory = await query<any>(
      `SELECT *, 'promissory' as type FROM promissory_notes WHERE note_number = ?`,
      [voucherNumber]
    );
    return [...receipts, ...promissory];
  } catch (error) {
    console.error('Search Voucher Error:', error);
    return [];
  }
}

export const dbToolsDefinitions = [
  {
    type: "function",
    function: {
      name: "searchEmployee",
      description: "Search for an employee by iqama number, name, or user code",
      parameters: {
        type: "object",
        properties: {
          searchTerm: {
            type: "string",
            description: "The iqama number, name, or user code of the employee"
          }
        },
        required: ["searchTerm"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchInvoice",
      description: "Search for a tax invoice by invoice number",
      parameters: {
        type: "object",
        properties: {
          invoiceNumber: {
            type: "string",
            description: "The tax invoice number"
          }
        },
        required: ["invoiceNumber"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchVehicle",
      description: "Search for a vehicle by plate number (Arabic/English), chassis number, or owner ID",
      parameters: {
        type: "object",
        properties: {
          searchTerm: {
            type: "string",
            description: "Plate number, chassis number, or owner ID"
          }
        },
        required: ["searchTerm"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchCreditNote",
      description: "Search for a credit note by its number",
      parameters: {
        type: "object",
        properties: {
          noteNumber: {
            type: "string",
            description: "The credit note number"
          }
        },
        required: ["noteNumber"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchVoucher",
      description: "Search for a receipt voucher or promissory note by its number",
      parameters: {
        type: "object",
        properties: {
          voucherNumber: {
            type: "string",
            description: "The voucher or note number"
          }
        },
        required: ["voucherNumber"]
      }
    }
  }
];
