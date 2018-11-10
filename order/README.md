# Coursier API

## Interface
### Produce
#### list_orders_to_be_delivered

```json
{
    orders:  [
    {
        id: 12,
        restaurant: {
            address:""
        },
        customer: {
            address:""
        },
        mustBePayed: true || false

    }
    ]
}
```
### Consume
#### get_ordered_to_be_delivered
#### finalise_order
#### order_delivered

## Test

### Scenario 1: Life Cycle

```
# Create Order in coursier persistence

kafka-console-producer --topic create_order_request --broker-list=localhost:9092
>
{"timestamp": 182038333,"meals": [{"id": 34,"name": "Mac fist","category": "burger","eta": 4,"price": 1.0,"restaurant": {"id": 12,"name": "mac do","address": "4 Privet Drive"}}],"customer": {"name": "Mario","address" : "3 Privet Drive"}}

# List Orders as Coursier

kafka-console-producer --topic get_ordered_to_be_delivered --broker-list=localhost:9092
>{   coursier: {  id: "1", address:"31 rue" } }

# Order is delivered: we remove it
kafka-console-producer --topic order_delivered --broker-list=localhost:9092
>{"order":{"id":"uuid"}}
```