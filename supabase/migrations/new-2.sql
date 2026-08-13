-- =========================================================
-- PAYMENTS TABLE
-- =========================================================

-- CUSTOMER: Can view their own payments
create policy "Customers can view own payments"
on public.payments
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'customer'
  )
);


-- WAREHOUSE MANAGER: Can view any payment
create policy "Warehouse managers can view payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
);


-- ADMIN: Can view any payment
create policy "Admins can view payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can insert payments
create policy "Admins can insert payments"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can update payments
create policy "Admins can update payments"
on public.payments
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can delete payments
create policy "Admins can delete payments"
on public.payments
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- =========================================================
-- ORDERS TABLE
-- =========================================================

-- CUSTOMER: Can view their own orders
create policy "Customers can view own orders"
on public.orders
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'customer'
  )
);


-- WAREHOUSE MANAGER: Can view any order
create policy "Warehouse managers can view orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
);


-- WAREHOUSE MANAGER: Can update any order
create policy "Warehouse managers can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
);


-- ADMIN: Can view any order
create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can insert any order
create policy "Admins can insert orders"
on public.orders
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can update any order
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can delete any order
create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- =========================================================
-- ORDER_ITEMS TABLE
-- =========================================================

-- CUSTOMER: Can view order items belonging to their own orders
create policy "Customers can view own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'customer'
  )
);


-- WAREHOUSE MANAGER: Can view any order item
create policy "Warehouse managers can view order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
);


-- WAREHOUSE MANAGER: Can update any order item
create policy "Warehouse managers can update order items"
on public.order_items
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  )
);


-- ADMIN: Can view any order item
create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can insert any order item
create policy "Admins can insert order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can update any order item
create policy "Admins can update order items"
on public.order_items
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);


-- ADMIN: Can delete any order item
create policy "Admins can delete order items"
on public.order_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);

-- =========================================================
-- AUTH HELPER FUNCTIONS
-- =========================================================

create schema if not exists auth_helpers;


-- ---------------------------------------------------------
-- Check if current user is a warehouse manager
-- ---------------------------------------------------------
create or replace function auth_helpers.is_warehouse_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'warehouse_manager'
  );
$$;


-- ---------------------------------------------------------
-- Check if current user is an admin
-- ---------------------------------------------------------
create or replace function auth_helpers.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  );
$$;


-- =========================================================
-- USER_ROLES RLS POLICIES
-- =========================================================

-- ---------------------------------------------------------
-- WAREHOUSE MANAGER
-- Can SELECT any user role
-- ---------------------------------------------------------
create policy "Warehouse managers can view user roles"
on public.user_roles
for select
to authenticated
using (
  auth_helpers.is_warehouse_manager()
);


-- ---------------------------------------------------------
-- ADMIN
-- Can SELECT any user role
-- ---------------------------------------------------------
create policy "Admins can view user roles"
on public.user_roles
for select
to authenticated
using (
  auth_helpers.is_admin()
);


-- ---------------------------------------------------------
-- ADMIN
-- Can INSERT any user role
-- ---------------------------------------------------------
create policy "Admins can insert user roles"
on public.user_roles
for insert
to authenticated
with check (
  auth_helpers.is_admin()
);


-- ---------------------------------------------------------
-- ADMIN
-- Can UPDATE any user role
-- ---------------------------------------------------------
create policy "Admins can update user roles"
on public.user_roles
for update
to authenticated
using (
  auth_helpers.is_admin()
)
with check (
  auth_helpers.is_admin()
);


-- ---------------------------------------------------------
-- ADMIN
-- Can DELETE any user role
-- ---------------------------------------------------------
create policy "Admins can delete user roles"
on public.user_roles
for delete
to authenticated
using (
  auth_helpers.is_admin()
);


-- ---------------------------------------------------------
-- USER
-- Can SELECT their own role(s)
-- ---------------------------------------------------------
create policy "Users can view own roles"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
);