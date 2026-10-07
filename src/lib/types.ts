export type SupplierDto = {
  id: number;
  name: string;
  phone: string;
  email: string;
};

export type MedicineDto = {
  id: number;
  name: string;
  category: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string;
  supplierId: number | null;
  supplier: SupplierDto | null;
};

export type MedicineInput = {
  name: string;
  category: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  expiryDate: string;
  supplierId: number | null;
};

export type SupplierInput = {
  name: string;
  phone: string;
  email: string;
};

export type SaleItemDto = {
  id: number;
  quantity: number;
  unitPrice: number;
  medicineId: number;
  medicine: { id: number; name: string };
};

export type SaleDto = {
  id: number;
  total: number;
  createdAt: string;
  items: SaleItemDto[];
};

export type DashboardData = {
  totalMedicines: number;
  totalStock: number;
  todaySales: number;
  todayRevenue: number;
  lowStock: MedicineDto[];
  recentSales: SaleDto[];
  chart: { label: string; amount: number }[];
};