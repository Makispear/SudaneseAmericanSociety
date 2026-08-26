const deleteAccountQuery = `
delete from users
where personal_id = $1
`;

export default deleteAccountQuery;
