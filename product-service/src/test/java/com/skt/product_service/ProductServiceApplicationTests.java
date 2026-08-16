package com.skt.product_service;

import io.restassured.RestAssured;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import com.skt.product_service.model.Laptop;
import com.skt.product_service.repository.ProductRepository;
import org.testcontainers.containers.MongoDBContainer;

import java.math.BigDecimal;
@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductServiceApplicationTests {

	@ServiceConnection
	static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:7.0.5");

	@LocalServerPort
	private Integer port;

	@Autowired
	private ProductRepository productRepository;

	@BeforeEach
	void setup() {
		RestAssured.baseURI = "http://localhost";
		RestAssured.port = port;
		productRepository.deleteAll();
	}

	@AfterEach
	void cleanup() {
		productRepository.deleteAll();
	}

	static {
		mongoDBContainer.start();

	}
	@Test
	void shouldCreateProduct() {
		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.multiPart("name", "iphone 15")
				.multiPart("description", "Iphone 15 Blue Color")
				.multiPart("price", "1000")
				.multiPart("productCategory", "laptop")
				.multiPart("brandName", "apple")
				.multiPart("categoryId", "electronics-laptops-business")
				.multiPart("processor", "Apple M2")
				.multiPart("ramGb", "8")
				.multiPart("storageGb", "256")
				.multiPart("screenSize", "13.6")
				.multiPart("graphics", "Apple GPU")
				.multiPart("productImages", "image.jpg", "fake-image".getBytes(), "image/jpeg")
				.when()
				.post("/api/product")
				.then()
				.statusCode(201)
				.body("id", Matchers.notNullValue())
				.body("name", Matchers.equalTo("iphone 15"))
				.body("categoryId", Matchers.equalTo("electronics-laptops-business"));
	}

	@Test
	void shouldReturnLaptopFormConfig() {
		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.when()
				.get("/api/product/types/laptop/form-config")
				.then()
				.statusCode(200)
				.body("productCategory", Matchers.equalTo("laptop"))
				.body("fields.size()", Matchers.equalTo(10))
				.body("fields.find { it.name == 'categoryId' }.type", Matchers.equalTo("select"))
				.body("fields.find { it.name == 'categoryId' }.options.size()", Matchers.greaterThan(0))
				.body("fields.find { it.name == 'brandName' }.required", Matchers.equalTo(true))
				.body("fields.find { it.name == 'processor' }.required", Matchers.equalTo(true))
				.body("fields.find { it.name == 'screenSize' }.required", Matchers.equalTo(true));
	}

	@Test
	void shouldReturnProductsPageWithFiltersAndSorting() {
		seedProduct("Dell Precision", "Business laptop", new BigDecimal("90000"), "Dell", "business-laptop");
		seedProduct("Dell Vostro", "Budget business laptop", new BigDecimal("55000"), "Dell", "business-laptop");
		seedProduct("HP Pavilion", "Gaming laptop", new BigDecimal("85000"), "HP", "gaming-laptop");

		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.queryParam("page", 0)
				.queryParam("size", 20)
				.queryParam("categoryId", "business-laptop")
				.queryParam("brand", "Dell")
				.queryParam("minPrice", 50000)
				.queryParam("maxPrice", 100000)
				.queryParam("sort", "price")
				.queryParam("direction", "asc")
				.when()
				.get("/api/product")
				.then()
				.statusCode(200)
				.body("items.size()", Matchers.equalTo(2))
				.body("totalElements", Matchers.equalTo(2))
				.body("items[0].name", Matchers.equalTo("Dell Vostro"))
				.body("items[1].name", Matchers.equalTo("Dell Precision"));
	}

	@Test
	void shouldReturnSearchResultsWithPagination() {
		seedProduct("Dell Precision", "Business laptop", new BigDecimal("90000"), "Dell", "business-laptop");
		seedProduct("Dell Vostro", "Budget business laptop", new BigDecimal("55000"), "Dell", "business-laptop");
		seedProduct("HP Pavilion", "Gaming laptop", new BigDecimal("85000"), "HP", "gaming-laptop");

		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.queryParam("q", "dell")
				.queryParam("categoryId", "business-laptop")
				.queryParam("brand", "Dell")
				.queryParam("page", 0)
				.queryParam("size", 1)
				.queryParam("sort", "price")
				.queryParam("direction", "asc")
				.when()
				.get("/api/product/search")
				.then()
				.statusCode(200)
				.body("items.size()", Matchers.equalTo(1))
				.body("totalElements", Matchers.equalTo(2))
				.body("hasNext", Matchers.equalTo(true))
				.body("items[0].name", Matchers.equalTo("Dell Vostro"));
	}

	@Test
	void shouldRejectInvalidQueryInputs() {
		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.queryParam("page", -1)
				.queryParam("size", 20)
				.when()
				.get("/api/product")
				.then()
				.statusCode(400);

		RestAssured.given()
				.auth().preemptive().basic("product_admin", "product_pass")
				.queryParam("q", " ")
				.queryParam("page", 0)
				.queryParam("size", 20)
				.when()
				.get("/api/product/search")
				.then()
				.statusCode(400);
	}

	private void seedProduct(
			String name,
			String description,
			BigDecimal price,
			String brandName,
			String categoryId
	) {
		Laptop product = Laptop.builder()
				.name(name)
				.description(description)
				.price(price)
				.productCategory("laptop")
				.brandName(brandName)
				.categoryId(categoryId)
				.processor("Intel")
				.ramGb("16")
				.storageGb("512")
				.screenSize("15.6")
				.graphics("RTX")
				.skuCode("SKU-" + Math.abs(name.hashCode()))
				.build();

		productRepository.save(product);
	}



}
