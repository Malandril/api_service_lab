
## Coursier

### Produce

#### list_orders_to_be_delivered

```json
{
    requestId: 24435323623,
    orders:  [
    {
        id: 12,
        restaurant: {
            address:""
        },
        customer: {
            address:""
        }
        
    }
    ]
}
```

#### order_tracker
```json
{
    orderId: "id",
    coursier: {
        id: "id",
        geoloc: {
            lat: 12,
            lng: 32
        }
    },
    eta: 37
    
}
```

### Consume
#### assign_delivery
#### cancel_delivery
#### get_ordered_to_be_delivered
#### finalise_order
#### order_delivered
#### update_geoloc
#### get_coursier_geoloc