package com.skt.inventory_service.module;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InventoryTest {

    @Test
    void shouldDefaultReservedQuantityToZeroAndCalculateAvailableQuantity() {
        Inventory inventory = new Inventory();

        inventory.setQuantity(10);

        assertEquals(0, inventory.getReservedQuantity());
        assertEquals(10, inventory.getAvailableQuantity());
    }

    @Test
    void shouldRecalculateAvailableQuantityWhenReservedQuantityChanges() {
        Inventory inventory = new Inventory();
        inventory.setQuantity(10);

        inventory.setReservedQuantity(3);

        assertEquals(7, inventory.getAvailableQuantity());
    }

    @Test
    void shouldRecalculateAvailableQuantityWhenQuantityChanges() {
        Inventory inventory = new Inventory();
        inventory.setQuantity(10);
        inventory.setReservedQuantity(3);

        inventory.setQuantity(12);

        assertEquals(9, inventory.getAvailableQuantity());
    }
}
