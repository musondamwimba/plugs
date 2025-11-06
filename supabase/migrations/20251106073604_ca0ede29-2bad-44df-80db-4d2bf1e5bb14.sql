-- Fix get_all_users_with_profiles function to handle email type correctly
CREATE OR REPLACE FUNCTION public.get_all_users_with_profiles()
RETURNS TABLE(
  id uuid, 
  email text, 
  full_name text, 
  phone_number text, 
  balance numeric, 
  created_at timestamp with time zone, 
  deleted_at timestamp with time zone, 
  user_moderation jsonb, 
  user_roles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,  -- Cast to text to fix type mismatch
    COALESCE(p.full_name, '') as full_name,
    p.phone_number,
    COALESCE(p.balance, 0) as balance,
    au.created_at,
    p.deleted_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'status', um.status,
          'reason', um.reason,
          'fine_amount', um.fine_amount,
          'expires_at', um.expires_at
        )
      )
      FROM user_moderation um
      WHERE um.user_id = au.id
    ) as user_moderation,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'role', ur.role
        )
      )
      FROM user_roles ur
      WHERE ur.user_id = au.id
    ) as user_roles
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  ORDER BY au.created_at DESC;
END;
$function$;