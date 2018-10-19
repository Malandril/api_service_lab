# Coursier Gateway

## Interface
### Produce
#### assign_delivery
```json
{
    orderId : "id",
    coursierId: "id"
}
```
#### get_ordered_to_be_delivered
```json
{
    coursier: {
        id: "51",
        address:"31 rue"
    }
}
```
    
#### order_delivered
```json
{
    order: {
        id: 12
    }
}
```

### Consume
#### list_orders_to_be_delivered
## Catalog
### Produce
#### meals_listed
```json
{
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
    ]
}
```
### Consume
#### list_meals

## Routes

### Search nearest order

```
    GET /deliveries/?address={address}&id={coursierId}
```
List nearest orders

### Assign delivery 

```
    POST /deliveries/

    {
        "orderId": "{orderId}",
        "coursierId": "{coursierId}"
    }
```
OrderId is given by the nearest search


### Notify order delivered

```
    POST /deliveries/

    {
        "orderId": "{orderId}"
    }
```