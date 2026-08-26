export const createAccountQuery = `
insert into public.users (first_name, last_name, gender, email, phone, membership_type, password_hash)
values ($1, $2, $3, $4, $5, $6, $7)
returning id, CONCAT(first_name, ' ', last_name) AS full_name, created_at;
`;

export const addDependants = `
insert into public.dependants (primary_member_id, first_name, last_name, gender, dob, relationship)
values ($1, $2, $3, $4, $5, $6);
`;
