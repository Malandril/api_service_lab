# Catalog
## Produce
### meals_listed
```json
{
    meals: [
        {
            id: "34",
            name: "Mac first",
            category: "Burger",
            eta: 4,
            price: 1.0,
            restaurant: {
                id: 12,
                name: "MacDo",
                address: "4 Privet Drive"
            }
        }
    ]
}
```
### feedback_listed
```json
{
    id: "42",
    name: "Mac first",
    category: "Burger",
    eta: 4,
    price: 1.0,
    feedback: [
        {
            rating: 4,
            customerId: "15",
            desc: "Awesome"

        }
    ],
    restaurant: {
        id: "12",
        name: "MacDo",
        address: "4 Privet Drive"
    }
}
```
## Consume
### list_meals
```json
{
    categories: ["asian","kebab"],
    restaurants: ["MacDo","BurgerKing"]
}
```
### add_feedback
```json
{
    mealId: "12",
    rating: 4,
    customerId: "15",
    desc: "Awesome"
}
```
### list_feeback
```json
{
    restaurantId : "12"
}
```

## Test

### Scenario 1: Life Cycle


#### List available meals
kafka-console-producer --topic list_meals --broker-list=kafka:9092
>{}
>{"restaurant": ["MacDo"]}
>{"name": "BigMac", "Whopper"}


#### Add a feedback
kafka-console-producer --topic get_todo_meals --broker-list=192.168.99.100:9092
>{"mealId": "69", "rating": 4, "customerId": "15", "desc": "Awesome"}

#### List feedback
kafka-console-producer --topic order_delivered --broker-list=192.168.99.100:9092
>{"restaurantId": "12"}