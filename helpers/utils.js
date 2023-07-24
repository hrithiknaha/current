const searchAppender = (queryString) => {
    const lowercaseQuery = queryString.toLowerCase();
    const queries = lowercaseQuery.split(" ");
    const query = queries.join("+");

    return query;
};

module.exports = { searchAppender };
