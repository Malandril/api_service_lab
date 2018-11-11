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

    val CustomerUrl = "http://localhost:8097";
    val RestaurantUrl = "http://localhost:8098";
    val CoursierUrl = "http://localhost:8099";

	val httpConfig = http
		.acceptEncodingHeader("gzip, deflate")
		.header(HttpHeaderNames.ContentType, HttpHeaderValues.ApplicationJson)
 		.header(HttpHeaderNames.Accept, HttpHeaderValues.ApplicationJson)

	val coursierId = "18";

	val customerConsultsMeals = scenario("Customer onsult meals")
		.exec(http("Customer gets meals")
			.get(s"$CustomerUrl/meals")
			.queryParam("category", "burger"))
	
	val couriserCheckNearbyOrders = scenario("Coursier lists nearby orders")
		.exec(http("Coursier lists nearby orders")
			.get(s"$CoursierUrl/deliveries")
			.queryParam("id", "12")
			.queryParam("address", "3 Rue principale"))
	
	val cookGetTodoMeals = scenario("Cook lists his todo meals")
		.exec(http("Cook lists his todo meals")
			.get(s"$RestaurantUrl/orders")
			.queryParam("id", "25")
			.queryParam("status", "todo"))
    
    val completeOrder = scenario("Complete order")
        .exec(http("Customer gets meals")
			.get(s"$CustomerUrl/meals")
			.queryParam("category", "burger")
			.queryParam("restaurant", "MacDo")
			.check(jsonPath("$.meals").saveAs("meals"))
			.check(jsonPath("$.meals[0].restaurant.id").saveAs("restaurantId"))
			.check(jsonPath("$.meals[0].id").saveAs("mealId")))
        .pause(1)
        .exec(http("Customer makes an order request")
			.post(s"$CustomerUrl/orders")
			.body(StringBody(session => compact(render(
				("meals" -> parse(session("meals").as[String])) ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive"))))))
			.check(jsonPath("$.orderId").saveAs("orderId")))
		.pause(1)
		.exec(http("Customer finalises his order")
			.put(s"$CustomerUrl/orders/" + "${orderId}")
			.body(StringBody(session => compact(render(
				("orderId" -> session("orderId").as[String]) ~ 
				("customer" -> 
					("name" -> "Bob") ~ 
					("address" -> "4 Privet Drive")) ~
				("meals" -> parse(session("meals").as[String])) ~
				("creditCard" ->
					("name" -> "Bob") ~
					("number" -> "551512348989") ~
					("ccv" -> "775") ~
					("limit" -> "07/19")))))))
		.pause(1)
		.exec(http("Cook lists his todo meals")
			.get(s"$RestaurantUrl/orders")
			.queryParam("id", "${restaurantId}")
			.queryParam("status", "todo"))
		.pause(1)
		.exec(http("Coursier lists nearby orders")
			.get(s"$CoursierUrl/deliveries")
			.queryParam("id", coursierId)
			.queryParam("address", "3 Rue principale"))
        .pause(1)
        .exec(http("Couriser assigns delivery")
			.post(s"$CoursierUrl/deliveries")
			.body(StringBody(session => compact(render(
				("coursierId" -> coursierId) ~ 
				("orderId" -> session("orderId").as[String]))))))
		.pause(1)
		.exec(http("Cook finished the meals")
			.put(s"$RestaurantUrl/orders/" + "${orderId}")
			.body(StringBody(session => compact(render(
				("orderId" -> session("orderId").as[String]))))))
		.pause(1)
		.repeat(5, "_") {
			exec(http("Coursier update is position")
				.put(s"$CoursierUrl/geolocation/")
				.body(StringBody(session => compact(render(
					("orderId" -> session("orderId").as[String]) ~
					("coursierId" -> coursierId))))))
			.pause(1)
			.exec(http("Customer check coursier position")
				.get(s"$CustomerUrl/geolocation/" + "${orderId}")
				.queryParam("orderId", session => session("orderId").as[String])
				.queryParam("lat", "21")
				.queryParam("long", "24"))
			.pause(1)
		}
		.exec(http("Couriser delivers the order")
			.put(s"$CoursierUrl/deliveries/" + "${orderId}")
			.body(StringBody(session => compact(render(
				("coursierId" -> coursierId))))))
		.pause(1)
		.exec(http("Customer leave a feedback")
			.post(s"$CustomerUrl/feedbacks/")
			.body(StringBody(session => compact(render(
				("mealId" -> session("mealId").as[String]) ~ 
				("rating" -> "4") ~ 
				("customerId" -> "42") ~ 
				("desc" -> "Super, j'adore !"))))))
		.pause(1)
		.exec(http("Cook lists his delivered meals")
			.get(s"$RestaurantUrl/orders")
			.queryParam("id", "${restaurantId}")
			.queryParam("status", "delivered"))
		.pause(1)
		.exec(http("Cook lists his feedbacks")
			.get(s"$RestaurantUrl/feedbacks/" + "${restaurantId}")
			.queryParam("restaurantId", "${restaurantId}"))
		.pause(1)
		.exec(http("Cook lists his statistics")
			.get(s"$RestaurantUrl/statistics/" + "${restaurantId}")
			.queryParam("restaurantId", "${restaurantId}"))


	val duration = 60

	setUp(
		customerConsultsMeals.inject(rampUsers(50) during (duration seconds)).protocols(httpConfig),
		couriserCheckNearbyOrders.inject(rampUsers(10) during (duration seconds)).protocols(httpConfig),
		cookGetTodoMeals.inject(rampUsers(5) during (duration seconds)).protocols(httpConfig),
		completeOrder.inject(rampUsers(5) during (duration seconds)).protocols(httpConfig),
	)
}