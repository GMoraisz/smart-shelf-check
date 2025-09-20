-- Create products table
CREATE TABLE public.products (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric,
  barcode text,
  image_url text,
  stock bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create scan_history table
CREATE TABLE public.scan_history (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Scan history policies (user-specific access)
CREATE POLICY "Allow authenticated users to read their own scan history" 
ON public.scan_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert into their own scan history" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert some sample products
INSERT INTO public.products (name, description, price, barcode, image_url, stock) VALUES
('iPhone 15 Pro', 'Smartphone Apple com 256GB', 999.99, '1234567890123', null, 50),
('Samsung Galaxy S24', 'Smartphone Samsung com 128GB', 799.99, '2345678901234', null, 30),
('MacBook Air M2', 'Laptop Apple com chip M2', 1299.99, '3456789012345', null, 20),
('AirPods Pro', 'Fones de ouvido Apple com cancelamento de ruído', 249.99, '4567890123456', null, 100),
('iPad Pro 12.9', 'Tablet Apple com tela de 12.9 polegadas', 1099.99, '5678901234567', null, 25);