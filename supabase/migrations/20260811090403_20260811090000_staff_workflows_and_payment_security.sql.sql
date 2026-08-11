/*
# Secure staff workflows and payment record ownership

1. New functions
- `update_order_status` lets administrators and warehouse managers move orders through fulfillment states.
- `assign_delivery_partner` lets administrators and warehouse managers assign a delivery partner and mark an order ready for pickup.
- `complete_delivery` lets the assigned delivery partner or administrator mark a delivery as picked up or delivered.

2. Security changes
- Every function derives the caller from `auth.uid()` and checks the caller's stored role.
- Functions use a fixed `public` search path and are executable only by signed-in users.
- Payment rows remain inaccessible for direct client inserts and updates; the payment edge function uses the service role after validating the signed-in customer.

3. Important notes
- Existing customer, catalog, cart, address, and order data is preserved.
- No tables, columns, or existing user data are removed.
*/

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
  update public.orders set status=p_status where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
end;
$$;

create or replace function public.assign_delivery_partner(p_order_id uuid, p_partner_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not (public.is_admin() or public.has_role('warehouse_manager')) then
    raise exception 'Not authorized';
  end if;
  if not exists (select 1 from public.user_roles where user_id=p_partner_id and role='delivery_partner') then
    raise exception 'Invalid delivery partner';
  end if;
  insert into public.delivery_assignments(order_id,delivery_partner_id,status)
  values(p_order_id,p_partner_id,'ready_for_pickup')
  on conflict(order_id) do update set delivery_partner_id=excluded.delivery_partner_id,status='ready_for_pickup',updated_at=now();
  update public.orders set status='ready_for_pickup' where id=p_order_id;
end;
$$;

create or replace function public.complete_delivery(p_assignment_id uuid, p_status public.order_status)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare v_order_id uuid; begin
  select order_id into v_order_id from public.delivery_assignments where id=p_assignment_id and (delivery_partner_id=auth.uid() or public.is_admin());
  if v_order_id is null then raise exception 'Not authorized'; end if;
  if p_status='out_for_delivery' then
    update public.delivery_assignments set status=p_status,picked_up_at=coalesce(picked_up_at,now()) where id=p_assignment_id;
  elsif p_status='delivered' then
    update public.delivery_assignments set status=p_status,delivered_at=now() where id=p_assignment_id;
  else
    raise exception 'Invalid delivery status';
  end if;
  update public.orders set status=p_status where id=v_order_id;
end;
$$;

revoke all on function public.update_order_status(uuid,public.order_status) from public,anon;
revoke all on function public.assign_delivery_partner(uuid,uuid) from public,anon;
revoke all on function public.complete_delivery(uuid,public.order_status) from public,anon;
grant execute on function public.update_order_status(uuid,public.order_status) to authenticated;
grant execute on function public.assign_delivery_partner(uuid,uuid) to authenticated;
grant execute on function public.complete_delivery(uuid,public.order_status) to authenticated;
