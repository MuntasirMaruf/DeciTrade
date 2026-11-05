-- ============================================================================
-- DeciTrade: B2B Wholesale Marketplace Database Schema (Supabase / PostgreSQL)
-- ============================================================================
-- Architecture: Hybrid Pattern (Supabase Data/Auth + NestJS Backend Engine)
-- ============================================================================

-- ============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ============================================================================

-- Four distinct platform roles
CREATE TYPE public.user_role AS ENUM ('WHOLESALER', 'RETAILER', 'CUSTOMER', 'ADMIN');

-- Granular admin sub-roles for internal staff
CREATE TYPE public.admin_role AS ENUM ('SUPER_ADMIN', 'COMPLIANCE', 'SUPPORT', 'FINANCE');

CREATE TYPE public.connection_status AS ENUM (
    'PENDING_REVIEW',      -- Retailer uploaded KYC and is waiting for wholesaler review
    'REVISION_REQUIRED',   -- Wholesaler requested clearer/new documents
    'ACTIVE',              -- Connected mutually; catalog & ordering unlocked
    'REJECTED',            -- Wholesaler denied the connection
    'BLOCKED'              -- Either party blocked the other
);

CREATE TYPE public.connection_source AS ENUM ('INVITE', 'DIRECTORY');

CREATE TYPE public.kyc_doc_type AS ENUM (
    'TRADE_LICENSE',
    'TAX_CERTIFICATE',
    'VAT_REGISTRATION',
    'NATIONAL_ID',
    'OTHER'
);

CREATE TYPE public.kyc_doc_status AS ENUM ('SUBMITTED', 'APPROVED', 'NEEDS_REVISION', 'REJECTED');

CREATE TYPE public.order_status AS ENUM (
    'SUBMITTED',           -- Retailer placed initial Purchase Order
    'INVOICE_SENT',        -- Wholesaler adjusted stock/shipping and issued counter-offer
    'ACCEPTED',            -- Retailer confirmed the counter-offer
    'DECLINED',            -- Retailer declined counter-offer (with reason)
    'PROCESSING',          -- Wholesaler preparing items in warehouse
    'SHIPPED',             -- Goods dispatched with receipt/tracking
    'DELIVERED',           -- Goods received by retailer
    'CANCELLED'            -- Order aborted
);

CREATE TYPE public.order_item_status AS ENUM ('ORIGINAL', 'MODIFIED', 'OUT_OF_STOCK');

CREATE TYPE public.payment_terms AS ENUM ('PAY_UPFRONT', 'CASH_ON_DELIVERY', 'NET_30');

-- Physical payment instrument/channel
CREATE TYPE public.payment_method AS ENUM (
    'BANK_TRANSFER',
    'CASH',
    'BKASH',
    'CARD',
    'CHEQUE'
);

CREATE TYPE public.payment_status AS ENUM (
    'UNPAID',
    'PAID',
    'PENDING_TERMS',       -- For COD or NET_30 after order acceptance
    'OVERDUE',             -- For NET_30 past due date
    'REFUNDED'
);


-- ============================================================================
-- 2. IDENTITY & PROFILES (EXTENDS supabase auth.users)
-- ============================================================================

-- Base profiles table: every user (Wholesaler, Retailer, Customer, Admin) lives here
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL DEFAULT 'WHOLESALER',
    business_name VARCHAR(255) NOT NULL DEFAULT '',
    contact_person VARCHAR(150),
    phone_number VARCHAR(50) NOT NULL DEFAULT '',
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wholesaler domain details
CREATE TABLE public.wholesalers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    description TEXT,
    trade_license_number VARCHAR(100),
    tax_id VARCHAR(100),
    warehouse_address TEXT NOT NULL DEFAULT '',
    rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    categories TEXT[] NOT NULL DEFAULT '{}',
    is_catalog_public BOOLEAN NOT NULL DEFAULT FALSE,
    min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    accepted_payment_terms public.payment_terms[] NOT NULL DEFAULT ARRAY['PAY_UPFRONT'::public.payment_terms, 'CASH_ON_DELIVERY'::public.payment_terms, 'NET_30'::public.payment_terms],
    accepted_payment_methods public.payment_method[] NOT NULL DEFAULT ARRAY['BANK_TRANSFER'::public.payment_method, 'CASH'::public.payment_method],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retailer domain details
CREATE TABLE public.retailers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    trade_license_number VARCHAR(100),
    delivery_address TEXT NOT NULL DEFAULT '',
    shop_category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internal staff & admin permissions (Future-proof RBAC)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_role public.admin_role NOT NULL DEFAULT 'SUPPORT',
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    permissions TEXT[] NOT NULL DEFAULT '{}',       -- e.g. ['manage_kyc', 'view_orders', 'issue_refunds']
    department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 3. NETWORKING, INVITATION TOKENS & KYC
-- ============================================================================

-- Scenario 1: Wholesaler unique invite links
CREATE TABLE public.invitation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesaler_id UUID NOT NULL REFERENCES public.wholesalers(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    notes VARCHAR(255),
    max_uses INT DEFAULT 1,                        -- NULL = unlimited uses
    uses_count INT NOT NULL DEFAULT 0,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_tokens_lookup ON public.invitation_tokens(token) WHERE is_revoked = FALSE;

-- Scenario 1 & 2: B2B Network Connections
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesaler_id UUID NOT NULL REFERENCES public.wholesalers(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    status public.connection_status NOT NULL DEFAULT 'PENDING_REVIEW',
    connected_via public.connection_source NOT NULL DEFAULT 'DIRECTORY',
    invitation_token_id UUID REFERENCES public.invitation_tokens(id) ON DELETE SET NULL,
    revision_notes TEXT,                           -- Feedback if document revision is required
    rejection_reason TEXT,
    connected_at TIMESTAMPTZ,                      -- Timestamp when status changed to ACTIVE
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wholesaler_retailer_connection UNIQUE (wholesaler_id, retailer_id)
);

CREATE INDEX idx_connections_wholesaler ON public.connections(wholesaler_id, status);
CREATE INDEX idx_connections_retailer ON public.connections(retailer_id, status);

-- Scenario 2: Business KYC documents uploaded by Retailer
CREATE TABLE public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    document_type public.kyc_doc_type NOT NULL,
    file_storage_path TEXT NOT NULL,               -- Storage path in private Supabase bucket 'kyc-documents'
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status public.kyc_doc_status NOT NULL DEFAULT 'SUBMITTED',
    rejection_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_kyc_docs_connection ON public.kyc_documents(connection_id);
CREATE INDEX idx_kyc_docs_retailer ON public.kyc_documents(retailer_id);

-- Scenario 2: Audit log for KYC document revisions
CREATE TABLE public.kyc_revision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.kyc_documents(id) ON DELETE SET NULL,
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    revision_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 4. CATALOG & PRODUCTS
-- ============================================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesaler_id UUID REFERENCES public.wholesalers(id) ON DELETE CASCADE, -- NULL = platform global
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesaler_id UUID NOT NULL REFERENCES public.wholesalers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'piece',     -- 'carton', 'box', 'piece', 'kg'
    price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2),               -- Original reference price for promotional strikethrough (e.g. was $100, now $85)
    cost_price DECIMAL(12, 2),                     -- Private wholesale margin (strictly excluded from retailer queries)
    discount_starts_at TIMESTAMPTZ,                -- Optional start date for scheduled promotional offer
    discount_ends_at TIMESTAMPTZ,                  -- Optional expiration date for scheduled promotional offer
    price_tiers JSONB NOT NULL DEFAULT '[]',       -- B2B bulk volume discount tiers: [{"min_quantity": 50, "unit_price": 90.00}, {"min_quantity": 100, "unit_price": 80.00}]
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,      -- Locked stock for orders in negotiation/processing
    min_order_quantity INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wholesaler_product_sku UNIQUE (wholesaler_id, sku)
);

CREATE INDEX idx_products_wholesaler ON public.products(wholesaler_id, is_active);
CREATE INDEX idx_products_discount_active ON public.products(wholesaler_id, discount_starts_at, discount_ends_at) WHERE discount_ends_at IS NOT NULL;


-- ============================================================================
-- 5. ORDERS, NEGOTIATION & INVOICING (SCENARIO 3)
-- ============================================================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,       -- e.g. "PO-20261105-0001"
    retailer_id UUID NOT NULL REFERENCES public.retailers(id),
    wholesaler_id UUID NOT NULL REFERENCES public.wholesalers(id),
    status public.order_status NOT NULL DEFAULT 'SUBMITTED',
    payment_terms public.payment_terms NOT NULL DEFAULT 'PAY_UPFRONT',
    payment_method public.payment_method,           -- Selected / settled channel (BANK_TRANSFER, CASH, BKASH, etc.)
    payment_status public.payment_status NOT NULL DEFAULT 'UNPAID',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_address_snapshot TEXT NOT NULL DEFAULT '', -- Permanent address snapshot at order placement
    wholesaler_notes TEXT,                          -- Notes sent with revised invoice
    decline_reason TEXT,                            -- Mandatory reason if Retailer declines
    payment_due_date DATE,                          -- Due date for NET_30
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    tracking_number VARCHAR(100),
    delivery_receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_retailer ON public.orders(retailer_id, status);
CREATE INDEX idx_orders_wholesaler ON public.orders(wholesaler_id, status);

-- Line-item negotiation table: Tracks requested vs confirmed stock
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name_snapshot VARCHAR(255) NOT NULL,
    product_sku_snapshot VARCHAR(100) NOT NULL,
    requested_quantity INT NOT NULL,               -- What the retailer originally requested
    confirmed_quantity INT,                        -- Wholesaler adjusted quantity
    original_unit_price DECIMAL(12, 2),            -- Base catalog price before volume/promo discount (for receipt comparison)
    unit_price_snapshot DECIMAL(12, 2) NOT NULL,   -- Applied price at order placement (with promo/tier applied)
    final_unit_price DECIMAL(12, 2),               -- Final negotiated counter-offer price
    line_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    item_status public.order_item_status NOT NULL DEFAULT 'ORIGINAL',
    wholesaler_item_note VARCHAR(255),             -- e.g. "Only 50 available in warehouse"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Generated final invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,    -- e.g. "INV-20261105-0001"
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    wholesaler_id UUID NOT NULL REFERENCES public.wholesalers(id),
    retailer_id UUID NOT NULL REFERENCES public.retailers(id),
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    payment_terms public.payment_terms NOT NULL,
    payment_method public.payment_method,           -- Settled payment channel
    payment_status public.payment_status NOT NULL DEFAULT 'UNPAID',
    pdf_storage_path TEXT,                         -- Supabase Storage file key in 'invoices'
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date DATE
);

-- State transition audit trail
CREATE TABLE public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status public.order_status,
    new_status public.order_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_history ON public.order_status_history(order_id);


-- ============================================================================
-- 6. NOTIFICATIONS
-- ============================================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,                     -- e.g. 'INVITE_RECEIVED', 'INVOICE_SENT'
    entity_type VARCHAR(50),                       -- 'order', 'connection'
    entity_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);


-- ============================================================================
-- 7. AUTOMATED TRIGGER: CONNECT SUPABASE auth.users TO public.profiles
-- ============================================================================
-- Automatically provisions profiles, wholesalers, retailers, or admins upon sign-up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val public.user_role;
    user_business_name TEXT;
    user_phone TEXT;
    user_contact TEXT;
BEGIN
    -- Extract values from user raw_user_meta_data JSON with safe fallback
    BEGIN
        user_role_val := COALESCE(
            (NEW.raw_user_meta_data->>'role')::public.user_role,
            'WHOLESALER'::public.user_role
        );
    EXCEPTION WHEN OTHERS THEN
        user_role_val := 'WHOLESALER'::public.user_role;
    END;
    user_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'DeciTrade User');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone_number', '');
    user_contact := COALESCE(NEW.raw_user_meta_data->>'contact_person', '');

    -- 1. Insert into public.profiles
    INSERT INTO public.profiles (id, role, business_name, contact_person, phone_number)
    VALUES (NEW.id, user_role_val, user_business_name, user_contact, user_phone);

    -- 2. Role-specific table initialization
    IF user_role_val = 'WHOLESALER' THEN
        INSERT INTO public.wholesalers (id, warehouse_address)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'warehouse_address', ''));
    ELSIF user_role_val = 'RETAILER' THEN
        INSERT INTO public.retailers (id, delivery_address)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'delivery_address', ''));
    ELSIF user_role_val = 'ADMIN' THEN
        INSERT INTO public.admins (id, admin_role, is_super_admin)
        VALUES (NEW.id, 'SUPPORT', FALSE);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 8. LEAN ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Architecture Rule: User-scoped ownership checks only.
-- Avoid heavy nested subqueries (e.g. EXISTS joins across connections) because
-- NestJS / Server Actions backend handles transactional business logic,
-- catalog margin sanitization, and state machine validation.
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesalers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES
-- Users read their own profile; verified businesses are visible to all authenticated users
CREATE POLICY "Users view own profile or verified profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (is_verified = TRUE OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- 8.2 WHOLESALERS (Directory Discovery)
CREATE POLICY "Wholesalers are viewable by authenticated users" ON public.wholesalers
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Wholesalers can update own details" ON public.wholesalers
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- 8.3 RETAILERS
CREATE POLICY "Retailers view own details" ON public.retailers
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Retailers update own details" ON public.retailers
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- 8.4 ADMINS
-- Staff can view their own sub-role and permissions.
-- Mutations (inviting staff, modifying permissions, promoting roles) are strictly restricted
-- to Backend / Service Role (NestJS or secure Server Actions) to eliminate privilege escalation attacks.
CREATE POLICY "Admins can view admin table" ON public.admins
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 8.5 INVITATION TOKENS
CREATE POLICY "Wholesalers manage own invite tokens" ON public.invitation_tokens
    FOR ALL TO authenticated
    USING (auth.uid() = wholesaler_id);

CREATE POLICY "Anyone can lookup valid invite tokens" ON public.invitation_tokens
    FOR SELECT
    USING (is_revoked = FALSE);

-- 8.6 CONNECTIONS (Direct participant check)
CREATE POLICY "Participants view their connections" ON public.connections
    FOR SELECT TO authenticated
    USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);

CREATE POLICY "Retailers initiate connections" ON public.connections
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = retailer_id);

CREATE POLICY "Participants update their connections" ON public.connections
    FOR UPDATE TO authenticated
    USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);

-- 8.7 PRODUCTS (Lean check: Wholesaler owns products; public/active viewable)
CREATE POLICY "Wholesalers have full control over own products" ON public.products
    FOR ALL TO authenticated
    USING (auth.uid() = wholesaler_id);

CREATE POLICY "Users can view active products" ON public.products
    FOR SELECT TO authenticated
    USING (is_active = TRUE);

-- 8.8 ORDERS & INVOICES (Direct participant checks — no subquery joins)
CREATE POLICY "Participants view their orders" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);

CREATE POLICY "Retailers create orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = retailer_id);

CREATE POLICY "Participants update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);

CREATE POLICY "Participants view invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (auth.uid() = wholesaler_id OR auth.uid() = retailer_id);

-- 8.9 NOTIFICATIONS
CREATE POLICY "Users manage own notifications" ON public.notifications
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 8.10 CATEGORIES (Public Reference Data)
CREATE POLICY "Categories are viewable by all authenticated users" ON public.categories
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Wholesalers manage own categories" ON public.categories
    FOR ALL TO authenticated
    USING (auth.uid() = wholesaler_id);

-- 8.11 ORDER ITEMS & STATUS HISTORY (Nested Order Reads & Counter-Offers)
CREATE POLICY "Participants view their order items" ON public.order_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.wholesaler_id = auth.uid() OR o.retailer_id = auth.uid())
        )
    );

CREATE POLICY "Retailers insert order items for own orders" ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND o.retailer_id = auth.uid()
        )
    );

CREATE POLICY "Participants update order items" ON public.order_items
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.wholesaler_id = auth.uid() OR o.retailer_id = auth.uid())
        )
    );

CREATE POLICY "Participants view order status history" ON public.order_status_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_status_history.order_id
            AND (o.wholesaler_id = auth.uid() OR o.retailer_id = auth.uid())
        )
    );

-- 8.12 KYC DOCUMENTS & REVISIONS
CREATE POLICY "Retailers manage own KYC documents" ON public.kyc_documents
    FOR ALL TO authenticated
    USING (auth.uid() = retailer_id);

CREATE POLICY "Wholesalers view KYC documents for their connections" ON public.kyc_documents
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.connections c
            WHERE c.id = kyc_documents.connection_id
            AND c.wholesaler_id = auth.uid()
        )
    );

CREATE POLICY "Participants view KYC revision history" ON public.kyc_revision_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.connections c
            WHERE c.id = kyc_revision_history.connection_id
            AND (c.wholesaler_id = auth.uid() OR c.retailer_id = auth.uid())
        )
    );
