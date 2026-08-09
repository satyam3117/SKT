import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://localhost:8181",
    realm: "spring-microservices-security-realm",
    clientId: "react-client"
});

export default keycloak;