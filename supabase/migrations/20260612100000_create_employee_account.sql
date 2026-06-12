-- Function to allow admin users to create employee accounts directly
CREATE OR REPLACE FUNCTION public.create_employee_account(
  new_email TEXT,
  new_password TEXT,
  new_full_name TEXT,
  new_phone TEXT,
  new_role public.app_role DEFAULT 'cashier'::public.app_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  caller_id UUID := auth.uid();
BEGIN
  -- 1. Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = caller_id AND user_roles.role = 'admin'::public.app_role
  ) THEN
    RAISE EXCEPTION 'Hanya admin yang dapat membuat akun pegawai';
  END IF;

  -- 2. Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = new_email) THEN
    RAISE EXCEPTION 'Email sudah terdaftar';
  END IF;

  -- 3. Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    crypt(new_password, gen_salt('bf')),
    now(), -- Confirm instantly
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', new_full_name, 'phone', new_phone),
    now(), now(), '', '', '', ''
  );

  -- 4. Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', new_email),
    'email',
    new_user_id::text,
    now(), now(), now()
  );

  -- 5. Profiles & roles tables will be populated by the trigger on_auth_user_created!
  -- Let's update the created profile and role to ensure they match parameters
  
  -- Update role if it's different from default cashier
  IF new_role != 'cashier'::public.app_role THEN
    UPDATE public.user_roles
    SET role = new_role
    WHERE user_roles.user_id = new_user_id;
  END IF;

  -- Update full_name and phone in profile
  UPDATE public.profiles
  SET full_name = new_full_name,
      phone = new_phone
  WHERE profiles.user_id = new_user_id;

  RETURN new_user_id;
END;
$$;
