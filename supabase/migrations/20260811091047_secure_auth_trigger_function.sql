/*
# Secure the auth trigger function

1. Security changes
- Revoke EXECUTE on `public.handle_new_auth_user()` from `anon` and `public` so unauthenticated callers cannot invoke it directly via the REST API.
- The function remains callable by the Postgres trigger on `auth.users` (trigger functions run with the owner's privileges, not the caller's).

2. Important notes
- No tables, columns, or user data are changed.
- All other SECURITY DEFINER functions (has_role, is_admin, is_operations_staff, update_order_status, assign_delivery_partner, complete_delivery, create_order, set_user_role) remain executable by authenticated users because they enforce their own role checks internally.
*/

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
