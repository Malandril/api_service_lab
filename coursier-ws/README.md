## Gateway Coursier

### Produce
#### update_geoloc
```json
{
    timestamp: 1718293,
    coursierId: "id",
    orderId: "id",
    geoloc: {
        long:"43",
        lat:"7"
    }
}
```
#### assign_delivery
```json
{
    timestamp: 1718293,
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
    timestamp:1540319618,
    coursierId: 56,
    order: {
        id: 12
    }
}
```
#### cancel_delivery
```json
{
    coursierId: "567",
    orderId: "34567"
}
```
### Consume
#### list_orders_to_be_delivered
