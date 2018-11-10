package uberoo

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class CompleteScenario extends Simulation {

    val Customer_url = "http://localhost:8097";
    val Restaurant_url = "http://localhost:8098";
    val Coursier_url = "http://localhost:8099";

	val httpConfig = http
		.acceptEncodingHeader("gzip, deflate")

	val consultMeals = scenario("Consult meals")
		.exec(http("Get meals")
			.get(s"$Customer_url/meals"))
    
    val order = scenario("Order")
        .exec(http("Get meals")
			.get(s"$Customer_url/meals")
			.queryParam("categories", "['burger']")
			.check(jsonPath("$")
				.saveAs("meals")))
        .pause(1)
        .exec(http("Order request")
			.post(s"$Customer_url/orders")
			.body(StringBody("""{ "calculateETA": { "meals": ${meals} } }""")))

	setUp(order.inject(rampUsers(10) during (10 seconds))).protocols(http.baseUrl(Customer_url))
}