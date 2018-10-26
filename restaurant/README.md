# Restaurant
## Produce
### todo_meals
```json
{
    orders: [{
        id: "number",
        meals: [
            {
                id: 69
                name: "Mac first"
            }
        ]
    }
    ]
}
```

## Consume
### finalise_order
```json
{
    timestamp: 1718293,
    order: {
        id: 12,
        meals: [
            {
                id: 34,
                name: "Mac fist",
                eta: 4,
                price: 1.0,            
                restaurant: {
                    id: 12,
                    name: "mac do",
                    address: "4 Privet Drive"
                }
            }
        ],
        customer: {
            name: "Mario",
            address : "3 Privet Drive"
        }
    }
}
```
### get_todo_meals
```json
{
    restaurantId : 12
}
```
### order_delivered
```json
{
    time_stamp:1540319618,
    order: {
        id: 12
    }
}
```

## Test

### Scenario 1: Life Cycle


# Add order to the todo meals

kafka-console-producer --topic finalise_order --broker-list=192.168.99.100:9092
>{"order": {"id": 42,"meals": [{"id": 34,"name": "Mac fist","eta": 4,"price": 1.0,"restaurant": {"id": 12,"name": "mac do","address": "4 Privet Drive"}}],"customer": {"name": "Mario","address": "3 Privet Drive"}}}

# Get the todo meals

kafka-console-producer --topic get_todo_meals --broker-list=192.168.99.100:9092
>{"restaurantId":12}

# Remove the meals from the todo list
kafka-console-producer --topic order_delivered --broker-list=192.168.99.100:9092
>{"time_stamp":1540319618,"order":{"id":12}}