CREATE TABLE t_orders (
                          id bigint(20) NOT NULL AUTO_INCREMENT, -- Unique identifier for each order
                          order_number varchar(255),              -- Identifier for the order (can be null)
                          sku_code varchar(255),                -- SKU code of the product
                          price decimal(18,3),                   -- Price of the product
                          quantity int(11),                     -- Quantity of the product ordered

                          PRIMARY KEY(id)                       -- Define 'id' as the primary key
);