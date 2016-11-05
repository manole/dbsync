module.exports = {
    dbReadQuery : `
         SELECT row_to_json(t) as data FROM (
            SELECT
                tickets.ticketid as ticketid,
                receipts.datenew as timestamp,
                customers.name as customerName,
                customers.id as customerId,
                people.name as personName,
                tickets.person as personId,
                (
                    SELECT array_to_json(array_agg(d)) FROM (
                        SELECT
                            products.name as productName,
                            ticketlines.product productId,
                            ticketlines.units as units,
                            ticketlines.price as price,
                            products.pricebuy as priceBuy,
                            products.pricesell as priceSell,
                            taxes.rate as taxRate,
                            ticketlines.taxid as taxId
                        FROM ticketlines
                            LEFT OUTER JOIN products ON (ticketlines.product = products.id)
                            LEFT OUTER JOIN taxes ON (ticketlines.taxid = taxes.id)
                        WHERE ticketlines.ticket = tickets.id
                    ) d
                ) as ticketlines
            FROM tickets
                LEFT OUTER JOIN customers ON (tickets.customer = customers.id)
                LEFT OUTER JOIN people ON (tickets.person = people.id)
                LEFT OUTER JOIN receipts ON (tickets.id = receipts.id)
            WHERE datenew >= ?
        ) t`
};