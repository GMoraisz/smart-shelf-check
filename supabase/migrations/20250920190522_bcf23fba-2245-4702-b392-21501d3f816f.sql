-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on scan_history table  
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create products policies (public read access)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Create scan history policies (user-specific access)
CREATE POLICY "Allow authenticated users to read their own scan history" 
ON public.scan_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert into their own scan history" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);