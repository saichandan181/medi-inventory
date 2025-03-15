
import { Invoice, InvoiceItem } from "@/services/inventoryService";
import { format } from "date-fns";

interface InvoicePrintViewProps {
  invoice: Invoice;
  items: InvoiceItem[];
}

export const InvoicePrintView = ({ invoice, items }: InvoicePrintViewProps) => {
  return (
    <div className="p-4 font-mono text-sm" style={{ fontFamily: "monospace" }}>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">NAGENDRA MEDICAL AND SURGICAL AGENCIES</h1>
        <h2>GST INVOICE</h2>
        <div className="flex justify-between mt-2">
          <div className="text-left">
            <p>18/505, B.K.M STREET</p>
            <p>KADAPA-516001</p>
            <p>Ph: 9550637507, 9912125515, 08562252</p>
          </div>
          <div className="text-right">
            <p>GSTIN No: 37AANFN1053B1ZK</p>
            <p>DL Nos: AP/11/1/2016-131075</p>
            <p>AP/11/1/2016-131076</p>
          </div>
        </div>
        <div className="border-t border-b border-gray-900 my-4"></div>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p><strong>To:</strong> {invoice.customer_name}</p>
          <p>{invoice.customer_address}</p>
          {invoice.customer_gstin && <p><strong>GSTIN:</strong> {invoice.customer_gstin}</p>}
          {invoice.customer_pan && <p><strong>PAN NO:</strong> {invoice.customer_pan}</p>}
          {invoice.customer_dl_number && <p><strong>DL Nos:</strong> {invoice.customer_dl_number}</p>}
        </div>
        <div className="text-right">
          <p><strong>INVOICE No:</strong> {invoice.invoice_number}</p>
          <p><strong>INVOICE Date:</strong> {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</p>
          <p><strong>Type:</strong> {invoice.payment_type === 'credit' ? 'Credit' : 'Cash'}</p>
        </div>
      </div>

      <div className="border-t border-b border-gray-900 my-4"></div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className="pr-2">MFG</th>
              <th className="px-2">HSNCODE</th>
              <th className="px-2">Product Name</th>
              <th className="px-2">Pack</th>
              <th className="px-2">Batch</th>
              <th className="px-2">Expr</th>
              <th className="px-2">Qty</th>
              <th className="px-2">Free</th>
              <th className="px-2">Dis%</th>
              <th className="px-2">M.R.P</th>
              <th className="px-2">Rate</th>
              <th className="px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t border-gray-300">
                <td className="pr-2">{item.medicine?.manufacturer || '-'}</td>
                <td className="px-2">{item.hsn_code}</td>
                <td className="px-2">{item.medicine?.name || 'Unknown Product'}</td>
                <td className="px-2">1</td>
                <td className="px-2">{item.batch_number}</td>
                <td className="px-2">{format(new Date(item.expiry_date), 'MM/yy')}</td>
                <td className="px-2">{item.quantity}</td>
                <td className="px-2">{item.free_quantity}</td>
                <td className="px-2">{item.discount_percentage}%</td>
                <td className="px-2">₹{item.mrp.toFixed(2)}</td>
                <td className="px-2">₹{item.rate.toFixed(2)}</td>
                <td className="px-2">₹{item.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-900 my-4"></div>

      <div className="flex justify-between">
        <div>
          <p><strong>Terms & Conditions:</strong></p>
          <p>1. Goods once sold will not be taken back.</p>
          <p>2. Subject to Kadapa Jurisdiction.</p>
        </div>
        <div className="text-right">
          <p><strong>Subtotal:</strong> ₹{(invoice.grand_total - invoice.total_tax).toFixed(2)}</p>
          <p><strong>GST:</strong> ₹{invoice.total_tax.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> ₹{invoice.grand_total.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8 text-right">
        <p>For NAGENDRA MEDICAL AND SURGICAL AGENCIES</p>
        <div className="mt-8">Authorized Signatory</div>
      </div>
    </div>
  );
};
