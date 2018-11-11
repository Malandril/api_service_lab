package uberoo

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._
import io.gatling.commons.validation._
import org.json4s._
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._

class CompleteScenario extends Simulation {

    val Customer_url = "http://localhost:8097";
    val Restaurant_url = "http://localhost:8098";
    val Coursier_url = "http://localhost:8099";

	val httpConfig = http
		.acceptEncodingHeader("gzip, deflate")
		.header(HttpHeaderNames.ContentType, HttpHeaderValues.ApplicationJson)
 		.header(HttpHeaderNames.Accept, HttpHeaderValues.ApplicationJson)

	val jsonContent = Map("Content-Type" -> "application/json")

	val consultMeals = scenario("Consult meals")
		.exec(http("Get meals")
			.get(s"$Customer_url/meals"))
    
    val order = scenario("Order")
        .exec(http("Get meals")
			.get(s"$Customer_url/meals?category=burger")
			.check(jsonPath("$.meals").saveAs("meals")))
        .pause(1)
        .exec(http("Order request")
			.post(s"$Customer_url/orders")
			.body(StringBody(session => compact(render(
				("meals" -> parse(session("meals").as[String])) ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive"))))))
			.check(jsonPath("$.orderId").saveAs("orderId")))
		.pause(1)
		.exec(http("Finalise order")
			.put(s"$Customer_url/orders/" + "${orderId}")
			.body(StringBody(session => compact(render(
				("orderId" -> "${orderId}") ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive")) ~
				("meals" -> parse(session("meals").as[String])) ~
				("creditCard" ->
					("name" -> "Bob") ~
					("number" -> "551512348989") ~
					("ccv" -> "775") ~
					("limit" -> "07/19")))))))


	setUp(order.inject(rampUsers(1) during (1 seconds))).protocols(httpConfig)
}