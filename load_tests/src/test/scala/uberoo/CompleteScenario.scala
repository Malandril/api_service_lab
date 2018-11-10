package uberoo

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._
import org.json4s._
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._

class CompleteScenario extends Simulation {

    val Customer_url = "http://192.168.99.100:8097";
    val Restaurant_url = "http://192.168.99.100:8098";
    val Coursier_url = "http://192.168.99.100:8099";

	val httpConfig = http
		.acceptEncodingHeader("gzip, deflate")

	val jsonContent = Map("Content-Type" -> "application/json")

	val consultMeals = scenario("Consult meals")
		.exec(http("Get meals")
			.get(s"$Customer_url/meals"))
    
    val order = scenario("Order")
        .exec(http("Get meals")
			.get(s"$Customer_url/meals?categories=['burger']")
			//.queryParam("categories", """["burger"]""")
			.check(jsonPath("$").saveAs("meals")))
        .pause(1)
        .exec(http("Order request")
			.post(s"$Customer_url/orders")
			.headers(jsonContent)
			.body(StringBody(compact(render(
				("meals" -> "${meals}") ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive")))))))
	/*		.check(jsonPath("$.orderId").saveAs("orderId")))
		.pause(1)
		.exec(http("Finalise order")
			.put(s"$Customer_url/orders/12")
			.body(StringBody(compact(render(
				("orderId" -> "${orderId}") ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive")) ~
				("meals" -> "$meals") ~
				("creditCard" ->
					("name" -> "Bob") ~
					("number" -> "551512348989") ~
					("ccv" -> "775") ~
					("limit" -> "07/19")))))))*/


	setUp(order.inject(rampUsers(1) during (1 seconds))).protocols(http.baseUrl(Customer_url))
}