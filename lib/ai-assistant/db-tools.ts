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
      `SELECT * FROM sales_invoices WHERE invoice_number = ? OR id = ?`,
      [invoiceNumber, invoiceNumber]
    );
    
    if (results.length > 0) {
      const invoice = results[0];
      // Fetch items for this invoice
      const items = await query<any>(
        `SELECT * FROM invoice_items WHERE invoice_id = ?`,
        [invoice.id]
      );
      invoice.items = items;
    }
    
    return results;
  } catch (error) {
    console.error('Search Invoice Error:', error);
    return [];
  }
}

export async function searchVehicle(searchTerm: string) {
  try {
    // Normalize search term (remove spaces)
    const normalized = searchTerm.replace(/\s+/g, '');
    const results = await query<any>(
      `SELECT v.*, d.name as driver_name 
       FROM vehicles v
       LEFT JOIN employees d ON v.driver_id = d.id
       WHERE REPLACE(v.plate_number_ar, ' ', '') = ? 
          OR REPLACE(v.plate_number_en, ' ', '') = ? 
          OR v.chassis_number = ? 
          OR v.owner_id_number = ?`,
      [normalized, normalized, searchTerm, searchTerm]
    );
    return results;
  } catch (error) {
    console.error('Search Vehicle Error:', error);
    return [];
  }
}

export async function searchMaintenanceOrder(orderNumber: string) {
  try {
    const results = await query<any>(
      `SELECT mr.*, v.plate_number_ar, v.plate_number_en, v.model, v.make
       FROM maintenance_requests mr
       JOIN vehicles v ON mr.vehicle_id = v.id
       WHERE mr.id = ?`,
      [orderNumber]
    );
    
    if (results.length > 0) {
      const order = results[0];
      // Fetch details for this maintenance order
      const details = await query<any>(
        `SELECT md.*, s.name as spare_name, s.code as spare_code 
         FROM maintenance_details md 
         JOIN spares s ON md.spare_id = s.id 
         WHERE md.maintenance_id = ?`,
        [order.id]
      );
      order.details = details;
    }
    
    return results;
  } catch (error) {
    console.error('Search Maintenance Order Error:', error);
    return [];
  }
}

export async function searchCreditNote(noteNumber: string) {
  try {
    const results = await query<any>(
      `SELECT * FROM credit_notes WHERE credit_note_number = ? OR id = ?`,
      [noteNumber, noteNumber]
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
      `SELECT *, 'receipt' as type FROM receipt_vouchers WHERE receipt_number = ? OR id = ?`,
      [voucherNumber, voucherNumber]
    );
    const promissory = await query<any>(
      `SELECT *, 'promissory' as type FROM promissory_notes WHERE note_number = ? OR id = ?`,
      [voucherNumber, voucherNumber]
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
      name: "searchMaintenanceOrder",
      description: "Search for a maintenance order or record by its number (ID)",
      parameters: {
        type: "object",
        properties: {
          orderNumber: {
            type: "string",
            description: "The maintenance order number or ID"
          }
        },
        required: ["orderNumber"]
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
