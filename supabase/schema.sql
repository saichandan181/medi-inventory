
-- Create tables for MedInventory360 system

-- Enable RLS (Row Level Security)
alter default privileges revoke execute on functions from public;

-- Medicine categories lookup table
create table if not exists medicine_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Suppliers table
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Medicines table
create table if not exists medicines (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  generic_name text,
  manufacturer text,
  category_id uuid references medicine_categories(id),
  batch_number text,
  expiry_date date,
  stock_quantity integer not null default 0,
  unit_price decimal(10, 2) not null default 0,
  reorder_level integer not null default 10,
  storage_condition text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Purchase orders table
create table if not exists purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id),
  reference_number text,
  order_date timestamp with time zone default now(),
  expected_delivery_date date,
  status text not null default 'pending',
  total_amount decimal(10, 2) not null default 0,
  notes text,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_at timestamp with time zone default now()
);

-- Purchase order items table
create table if not exists purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  purchase_order_id uuid references purchase_orders(id) on delete cascade,
  medicine_id uuid references medicines(id),
  quantity integer not null default 0,
  unit_price decimal(10, 2) not null default 0,
  total_price decimal(10, 2) not null default 0,
  created_at timestamp with time zone default now()
);

-- Transactions table for all stock movements
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('purchase', 'sale', 'return', 'adjustment')),
  medicine_id uuid references medicines(id),
  quantity integer not null,
  unit_price decimal(10, 2) not null,
  total_price decimal(10, 2) not null,
  reference_number text,
  supplier_id uuid references suppliers(id),
  notes text,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

-- Invoices table
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null,
  invoice_date timestamp with time zone not null default now(),
  customer_name text not null,
  customer_phone text,
  customer_address text,
  customer_gstin text,
  customer_dl_number text,
  customer_pan text,
  total_amount decimal(10, 2) not null default 0,
  total_tax decimal(10, 2) not null default 0,
  grand_total decimal(10, 2) not null default 0,
  payment_type text not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  created_by text not null
);

-- Invoice items table
create table if not exists invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  medicine_id uuid references medicines(id),
  batch_number text not null,
  expiry_date date not null,
  hsn_code text not null,
  quantity integer not null,
  free_quantity integer not null default 0,
  discount_percentage decimal not null default 0,
  mrp decimal not null,
  rate decimal not null,
  gst_percentage decimal not null default 0,
  gst_amount decimal not null default 0,
  total_amount decimal not null default 0,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on all tables
alter table medicine_categories enable row level security;
alter table suppliers enable row level security;
alter table medicines enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table transactions enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Create policies for authenticated users
create policy "Authenticated users can read all medicine categories"
  on medicine_categories for select
  to authenticated
  using (true);

create policy "Authenticated users can read all suppliers"
  on suppliers for select
  to authenticated
  using (true);

create policy "Authenticated users can read all medicines"
  on medicines for select
  to authenticated
  using (true);

create policy "Authenticated users can read all purchase orders"
  on purchase_orders for select
  to authenticated
  using (true);

create policy "Authenticated users can read all purchase order items"
  on purchase_order_items for select
  to authenticated
  using (true);

create policy "Authenticated users can read all transactions"
  on transactions for select
  to authenticated
  using (true);

create policy "Authenticated users can read all invoices"
  on invoices for select
  to authenticated
  using (true);

create policy "Authenticated users can read all invoice items"
  on invoice_items for select
  to authenticated
  using (true);

-- Insert some initial categories
insert into medicine_categories (name, description) values 
  ('Antibiotics', 'Medications that destroy or slow down the growth of bacteria'),
  ('Analgesics', 'Pain relievers'),
  ('Antihistamines', 'Drugs that oppose the action of histamine'),
  ('Antidiabetics', 'Medications used to treat diabetes mellitus'),
  ('Respiratory', 'Drugs that affect the respiratory system'),
  ('Cardiovascular', 'Medications for the heart and circulation');
