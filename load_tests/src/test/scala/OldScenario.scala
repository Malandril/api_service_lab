package default

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class ConsultAndETA extends Simulation {

	val order_url = "http://localhost:8000"
	val eta_url = "http://localhost:9090"
	val coursier_url = "http://localhost:8090"
	val restaurant_url = "http://localhost:8080"

	val httpConfig = http
		.acceptEncodingHeader("gzip, deflate")

	val consultMeals = scenario("Consult meals")
		.exec(http("Get meals")
			.get(order_url + "/meals")
			.check(jsonPath("$")
				.saveAs("mealList")))
		.pause(1)
		.exec(http("Compute ETA")
			.post(eta_url + "/eta")
			.body(StringBody("""{ "calculateETA": { "meals": ${mealList} } }""")))

	setUp(consultMeals.inject(rampUsers(100) during (60 seconds))).protocols(http.baseUrl(order_url))
}