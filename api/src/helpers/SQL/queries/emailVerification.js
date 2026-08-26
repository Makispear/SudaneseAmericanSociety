export const createEmailVerificationToken = `
  INSERT INTO public.email_verification_tokens
  (user_id, token_hash, expires_at)
  VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
  RETURNING id, expires_at;
`;
