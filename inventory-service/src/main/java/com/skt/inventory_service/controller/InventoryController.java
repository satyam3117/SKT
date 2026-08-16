package com.skt.inventory_service.controller;

import com.skt.inventory_service.dto.InventoryResponse;
import com.skt.inventory_service.dto.AvailabilityResponse;
import com.skt.inventory_service.dto.AdjustInventoryResponse;
import com.skt.inventory_service.dto.request.AdjustInventoryRequest;
import com.skt.inventory_service.dto.request.InventoryRequest;
import com.skt.inventory_service.dto.request.StockRequest;
import com.skt.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
  private  final InventoryService inventoryService;

  @GetMapping
  @ResponseStatus(HttpStatus.OK)
    public boolean isInStock(@RequestParam String skuCode,
                             @RequestParam Integer quantity) {
     return inventoryService.isInStock(skuCode,quantity);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public InventoryResponse createInventory(@RequestBody InventoryRequest inventoryRequest) {
      return inventoryService.createInventory(inventoryRequest);
  }

  @GetMapping("/{skuCode}")
  @ResponseStatus(HttpStatus.OK)
  public InventoryResponse getInventoryBySkuCode(@PathVariable String skuCode) {
      return inventoryService.getInventoryBySkuCode(skuCode);
  }

  @PostMapping("/{skuCode}/stock")
  @ResponseStatus(HttpStatus.OK)
  public InventoryResponse addStock(@PathVariable String skuCode, @RequestBody StockRequest stockRequest) {
      return inventoryService.addStock(skuCode, stockRequest);
  }

  @PostMapping("/{skuCode}/adjust")
  @ResponseStatus(HttpStatus.OK)
  public AdjustInventoryResponse adjustInventory(@PathVariable String skuCode,
                                                 @RequestBody AdjustInventoryRequest adjustInventoryRequest) {
      return inventoryService.adjustInventory(skuCode, adjustInventoryRequest);
  }

  @GetMapping("/{skuCode}/availability")
  @ResponseStatus(HttpStatus.OK)
  public AvailabilityResponse getAvailability(@PathVariable String skuCode,
                                              @RequestParam Integer quantity) {
      return inventoryService.getAvailability(skuCode, quantity);
  }




}
