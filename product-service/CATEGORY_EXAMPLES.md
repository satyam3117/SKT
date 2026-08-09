# Product Category Support - Examples

## Overview
The Product model now supports hierarchical categories through two fields:
- `categoryId`: Stores the leaf category ID for database relations and filtering
- `categoryPath`: Stores the full hierarchy path for UI display (optional)

## Example 1: Laptop with Complete Category Information

```json
{
  "id": "66b8f1234567890abcdef123",
  "name": "ThinkPad X1 Carbon Gen 11",
  "description": "Premium business laptop with exceptional performance",
  "price": 1499.99,
  "skuCode": "LENOVO-X1-GEN11-001",
  "brandName": "Lenovo",
  "productCategory": "laptop",
  "categoryId": "business-laptop-id",
  "categoryPath": ["Electronics", "Laptops", "Business Laptops"],
  "processor": "Intel Core i7-1365U",
  "ramGb": "16",
  "storageGb": "512",
  "screenSize": "14",
  "graphics": "Intel Iris Xe",
  "createdAt": "2024-08-09T09:20:00Z",
  "updatedAt": "2024-08-09T09:20:00Z"
}
```

## Example 2: Gaming Laptop

```json
{
  "id": "66b8f1234567890abcdef124",
  "name": "ROG Strix G15",
  "description": "High-performance gaming laptop",
  "price": 1899.99,
  "skuCode": "ASUS-ROG-G15-001",
  "brandName": "ASUS",
  "productCategory": "laptop",
  "categoryId": "gaming-laptop-id",
  "categoryPath": ["Electronics", "Laptops", "Gaming Laptops"],
  "processor": "AMD Ryzen 9 7940HS",
  "ramGb": "32",
  "storageGb": "1024",
  "screenSize": "15.6",
  "graphics": "NVIDIA RTX 4070",
  "createdAt": "2024-08-09T09:21:00Z",
  "updatedAt": "2024-08-09T09:21:00Z"
}
```

## Example 3: Computer (Desktop)

```json
{
  "id": "66b8f1234567890abcdef125",
  "name": "Dell OptiPlex 7090",
  "description": "Professional desktop computer",
  "price": 899.99,
  "skuCode": "DELL-OPT-7090-001",
  "brandName": "Dell",
  "productCategory": "computer",
  "categoryId": "desktop-computer-id",
  "categoryPath": ["Electronics", "Computers", "Desktop Computers"],
  "processor": "Intel Core i5-11500",
  "ramGb": "16",
  "storageGb": "512",
  "screenSize": "24",
  "graphics": "Intel UHD Graphics 750",
  "mouse": "Dell Wired Mouse",
  "keyboard": "Dell Wired Keyboard",
  "createdAt": "2024-08-09T09:22:00Z",
  "updatedAt": "2024-08-09T09:22:00Z"
}
```

## Example 4: Laptop with Minimal Category (categoryPath optional)

```json
{
  "id": "66b8f1234567890abcdef126",
  "name": "MacBook Air M2",
  "description": "Ultra-thin and light laptop",
  "price": 1199.99,
  "skuCode": "APPLE-MBA-M2-001",
  "brandName": "Apple",
  "productCategory": "laptop",
  "categoryId": "ultrabook-laptop-id",
  "processor": "Apple M2",
  "ramGb": "8",
  "storageGb": "256",
  "screenSize": "13.6",
  "graphics": "Apple M2 GPU",
  "createdAt": "2024-08-09T09:23:00Z",
  "updatedAt": "2024-08-09T09:23:00Z"
}
```

## Notes

### Key Points:
1. **categoryId** is required (validated with `@NotNull`)
2. **categoryPath** is optional but recommended for better UI support
3. All existing Lombok annotations (`@Data`, `@SuperBuilder`) work seamlessly
4. Jackson polymorphic serialization/deserialization continues to work
5. MongoDB mapping remains valid

### Database Queries:
```java
// Find all products in a specific category
List<Product> products = productRepository.findByCategoryId("business-laptop-id");

// Find all laptops in business category
List<Laptop> laptops = productRepository.findByProductCategoryAndCategoryId("laptop", "business-laptop-id");
```

### Builder Usage:
```java
// Creating a laptop with category information
Laptop laptop = Laptop.builder()
    .name("ThinkPad X1 Carbon Gen 11")
    .description("Premium business laptop")
    .price(new BigDecimal("1499.99"))
    .skuCode("LENOVO-X1-GEN11-001")
    .brandName("Lenovo")
    .productCategory("laptop")
    .categoryId("business-laptop-id")
    .categoryPath(Arrays.asList("Electronics", "Laptops", "Business Laptops"))
    .processor("Intel Core i7-1365U")
    .ramGb("16")
    .storageGb("512")
    .screenSize("14")
    .graphics("Intel Iris Xe")
    .build();
```

### Category Hierarchy Examples:

**Electronics → Laptops:**
- Business Laptops → `categoryId: "business-laptop-id"`
- Gaming Laptops → `categoryId: "gaming-laptop-id"`
- Ultrabooks → `categoryId: "ultrabook-laptop-id"`
- Budget Laptops → `categoryId: "budget-laptop-id"`

**Electronics → Computers:**
- Desktop Computers → `categoryId: "desktop-computer-id"`
- All-in-One Computers → `categoryId: "aio-computer-id"`
- Gaming Desktops → `categoryId: "gaming-desktop-id"`
- Workstations → `categoryId: "workstation-computer-id"`
