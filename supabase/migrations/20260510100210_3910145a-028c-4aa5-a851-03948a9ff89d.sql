
DO $$
DECLARE
  admin_uid uuid;
  existing_uid uuid;
BEGIN
  SELECT id INTO existing_uid FROM auth.users WHERE email = 'lmodirv@gmail.com' LIMIT 1;

  IF existing_uid IS NULL THEN
    admin_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      'lmodirv@gmail.com',
      crypt('admin@1234', gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers',ARRAY['email']),
      jsonb_build_object('full_name','Admin'),
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'lmodirv@gmail.com', 'email_verified', true),
      'email', admin_uid::text, now(), now(), now());
  ELSE
    admin_uid := existing_uid;
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (admin_uid, 'Admin')
  ON CONFLICT (id) DO NOTHING;

  DELETE FROM public.user_roles WHERE user_id = admin_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin');
END $$;
