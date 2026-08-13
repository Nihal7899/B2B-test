create or replace function public.update_order_status(p_order_id uuid, p_status public.order_status)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not (public.is_admin() or public.has_role('warehouse_manager')) then
    raise exception 'Not authorized';
  end if;
  -- Prevent setting status to 'confirmed' directly – use confirm_order()
  if p_status = 'confirmed' then
    raise exception 'Use confirm_order() to confirm an order and deduct stock.';
  end if;
  update public.orders set status = p_status where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;
end;
$$;

-- ================================================
-- 1. Drop and recreate create_order (NO stock deduction)
-- ================================================
drop function if exists public.create_order(uuid, jsonb);

create or replace function public.create_order(p_address_id uuid, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_delivery numeric(12,2) := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.addresses where id=p_address_id and user_id=auth.uid()) then
    raise exception 'Invalid address';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders(user_id, address_id)
  values (auth.uid(), p_address_id)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 10000 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid and is_active = true
    for update;

    if not found or v_product.stock_quantity < v_qty then
      raise exception 'Product unavailable';
    end if;

    v_subtotal := v_subtotal + (v_product.wholesale_price * v_qty);
    v_discount := v_discount + ((v_product.mrp - v_product.wholesale_price) * v_qty);

    insert into public.order_items (
      order_id, product_id, brand, product_name, pack_size,
      unit_price, mrp, quantity, line_total
    ) values (
      v_order_id, v_product.id, v_product.brand, v_product.name,
      v_product.pack_size, v_product.wholesale_price, v_product.mrp,
      v_qty, v_product.wholesale_price * v_qty
    );
    -- stock NOT deducted here
  end loop;

  if v_subtotal < 2000 then v_delivery := 80; end if;

  update public.orders
  set subtotal = v_subtotal,
      discount = v_discount,
      delivery_fee = v_delivery,
      total = v_subtotal + v_delivery
  where id = v_order_id;

  return v_order_id;
exception
  when others then raise exception 'Could not create order';
end;
$$;

grant execute on function public.create_order(uuid, jsonb) to authenticated;

-- ================================================
-- 2. confirm_order – deducts stock and sets status to 'confirmed'
-- ================================================
create or replace function public.confirm_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if not (public.is_admin() or public.has_role('warehouse_manager')) then
    raise exception 'Not authorized';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  if v_order.status != 'pending' then
    raise exception 'Only pending orders can be confirmed';
  end if;

  -- Deduct stock for each line item
  for v_item in select product_id, quantity from public.order_items where order_id = p_order_id loop
    update public.products
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.product_id;
    if not found then
      raise exception 'Product not found';
    end if;
    -- Ensure stock doesn't go negative
    if (select stock_quantity from public.products where id = v_item.product_id) < 0 then
      raise exception 'Insufficient stock for product';
    end if;
  end loop;

  update public.orders set status = 'confirmed' where id = p_order_id;
end;
$$;

grant execute on function public.confirm_order(uuid) to authenticated;

-- ================================================
-- 3. Cleanup stale orders (uses updated_at)
-- ================================================
create or replace function public.cleanup_stale_orders()
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare
  v_count integer;
begin
  with stale_orders as (
    select o.id
    from public.orders o
    left join public.payments p on p.order_id = o.id and p.status = 'paid'
    where o.status = 'pending'
      and o.updated_at < now() - interval '15 minutes'
      and p.id is null
  )
  update public.orders
  set status = 'cancelled'
  where id in (select id from stale_orders)
  returning id;

  get diagnostics v_count = row_count;
  
  update public.payments
  set status = 'cancelled'
  where order_id in (select id from stale_orders)
  and status = 'pending';
  
  return v_count;
end;
$$;

grant execute on function public.cleanup_stale_orders() to authenticated;

-- If you have pg_cron installed, schedule it to run every 5 minutes:
-- select cron.schedule('cleanup-stale-orders', '*/5 * * * *', 'select public.cleanup_stale_orders();');