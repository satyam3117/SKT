//package com.skt.inventory_service.controller;
//
//import com.skt.inventory_service.dto.AdjustInventoryResponse;
//import com.skt.inventory_service.dto.AvailabilityResponse;
//import com.skt.inventory_service.exception.DuplicateSkuCodeException;
//import com.skt.inventory_service.exception.InventoryNotFoundException;
//import com.skt.inventory_service.dto.InventoryResponse;
//import com.skt.inventory_service.dto.request.AdjustInventoryRequest;
//import com.skt.inventory_service.dto.request.StockRequest;
//import com.skt.inventory_service.service.InventoryService;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@WebMvcTest(InventoryController.class)
//class InventoryControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private InventoryService inventoryService;
//
//    @Test
//    void shouldReturnPlainTextConflictWhenSkuAlreadyExists() throws Exception {
//        when(inventoryService.createInventory(any())).thenThrow(new DuplicateSkuCodeException("SKU-1"));
//
//        mockMvc.perform(post("/api/inventory")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("""
//                                {
//                                  "skuCode": "SKU-1",
//                                  "quantity": 10,
//                                  "reservedQuantity": 0,
//                                  "availableQuantity": 10,
//                                  "warehouse": "WH-1"
//                                }
//                                """))
//                .andExpect(status().isConflict())
//                .andExpect(content().string("SKU code already exists"));
//    }
//
//    @Test
//    void shouldReturnInventoryWhenSkuExists() throws Exception {
//        when(inventoryService.getInventoryBySkuCode("LAPTOP-001")).thenReturn(
//                new InventoryResponse(1L, "LAPTOP-001", 20, 3, 17, "KOLKATA-WH-01")
//        );
//
//        mockMvc.perform(get("/api/inventory/LAPTOP-001"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.skuCode").value("LAPTOP-001"))
//                .andExpect(jsonPath("$.quantity").value(20))
//                .andExpect(jsonPath("$.reservedQuantity").value(3))
//                .andExpect(jsonPath("$.availableQuantity").value(17))
//                .andExpect(jsonPath("$.warehouse").value("KOLKATA-WH-01"));
//    }
//
//    @Test
//    void shouldReturnPlainTextNotFoundWhenSkuDoesNotExist() throws Exception {
//        when(inventoryService.getInventoryBySkuCode("MISSING-SKU"))
//                .thenThrow(new InventoryNotFoundException("MISSING-SKU"));
//
//        mockMvc.perform(get("/api/inventory/MISSING-SKU"))
//                .andExpect(status().isNotFound())
//                .andExpect(content().string("Inventory not found for SKU code: MISSING-SKU"));
//    }
//
//    @Test
//    void shouldAddStockForSku() throws Exception {
//        when(inventoryService.addStock(eq("LAPTOP-001"), any(StockRequest.class))).thenReturn(
//                new InventoryResponse(1L, "LAPTOP-001", 40, 3, 37, "KOLKATA-WH-01")
//        );
//
//        mockMvc.perform(post("/api/inventory/LAPTOP-001/stock")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("""
//                                {
//                                  "quantity": 20,
//                                  "warehouse": "KOLKATA-WH-01"
//                                }
//                                """))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.skuCode").value("LAPTOP-001"))
//                .andExpect(jsonPath("$.quantity").value(40))
//                .andExpect(jsonPath("$.reservedQuantity").value(3))
//                .andExpect(jsonPath("$.availableQuantity").value(37))
//                .andExpect(jsonPath("$.warehouse").value("KOLKATA-WH-01"));
//    }
//
//    @Test
//    void shouldAdjustStockForSku() throws Exception {
//        when(inventoryService.adjustInventory(eq("LAPTOP-001"), any(AdjustInventoryRequest.class))).thenReturn(
//                new AdjustInventoryResponse("LAPTOP-001", 38, 3, 35, "KOLKATA")
//        );
//
//        mockMvc.perform(post("/api/inventory/LAPTOP-001/adjust")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("""
//                                {
//                                  "quantity": -2,
//                                  "reason": "DAMAGED"
//                                }
//                                """))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.skuCode").value("LAPTOP-001"))
//                .andExpect(jsonPath("$.quantity").value(38))
//                .andExpect(jsonPath("$.reservedQuantity").value(3))
//                .andExpect(jsonPath("$.availableQuantity").value(35));
//    }
//
//    @Test
//    void shouldReturnAvailabilityForSku() throws Exception {
//        when(inventoryService.getAvailability("LAPTOP-001")).thenReturn(
//                new AvailabilityResponse("LAPTOP-001", true, 17)
//        );
//
//        mockMvc.perform(get("/api/inventory/LAPTOP-001/availability"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.skuCode").value("LAPTOP-001"))
//                .andExpect(jsonPath("$.inStock").value(true))
//                .andExpect(jsonPath("$.availableQuantity").value(17));
//    }
//}
