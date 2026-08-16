ALTER TABLE t_inventory
    ADD COLUMN reserved_quantity INT NOT NULL DEFAULT 0,
ADD COLUMN available_quantity INT NOT NULL DEFAULT 0,
ADD COLUMN warehouse VARCHAR(255) DEFAULT NULL;

UPDATE t_inventory
SET available_quantity = quantity - reserved_quantity;