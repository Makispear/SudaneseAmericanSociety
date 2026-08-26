const getAllusersQuery = `
SELECT
    public_id,
    CONCAT(first_name, ' ', last_name) as full_name 
FROM users;`

export default getAllusersQuery
