
## Order
### Produce
#### create_order
```json
{
    requestId: 45433874839,
    orderId: "uuid",
    events: [
        {
            event: "creation", 
            time: 36478836478
        }
    ]
    
}
```
#### finalise_order
```json
{
    timestamp: 1718293,
    order: {
        id: "uuid",
        meals: [
            {
                id: 34,
                name: "Mac fist",
                category: "burger",
                type:"main_course",
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

### Consume
#### submit_order
#### payment_failed
#### payment_succeeded
#### create_order_request
#### assign_delivery
#### meal_cooked
#### order_delivered
#### price_computed
#### cancel_delivery