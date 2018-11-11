
## Payment
### Produce
#### payment_failed
#### payment_succeeded
```json
{
    order{
        id: "49678"
    }
}
```
### Consume
#### submit_order
#### price_computed




## Statistics
### Produce
#### statistics
```json
{
    coursiers:  [
        {
            id: "12",
            orders : [
                {
                    time: 121,
                    date: "ISO formatted date",
                    meals: [{
                        id: "id"
                    }]
                }
            ]
        }, ...
    ]
    
}
```
### Consume
#### meal_cooked
#### order_delivered
#### assign_delivery
#### finalise_order
#### get_statistics