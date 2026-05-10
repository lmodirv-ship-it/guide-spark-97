UPDATE auth.users
SET encrypted_password = crypt(gen_random_uuid()::text || gen_random_uuid()::text, gen_salt('bf'))
WHERE email = 'lmodirv@gmail.com';