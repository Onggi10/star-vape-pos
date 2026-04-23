-- Create admin user directly in auth.users
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@starvape.com') THEN
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
      'admin@starvape.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrator"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'admin@starvape.com'),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (user_id, full_name)
  SELECT id, 'Administrator' FROM auth.users WHERE email = 'admin@starvape.com'
  ON CONFLICT DO NOTHING;

  -- Promote to admin role
  DELETE FROM public.user_roles
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@starvape.com');
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'admin@starvape.com';
END $$;