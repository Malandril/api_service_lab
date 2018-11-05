# Statistics API

## Interface
### Produce
#### statistics
```json
{
    coursiers:  [
        {
            id: "12",
            orders : [
                {
                    time: 12 sec,
                    date: lundi 18heures ISO,
                    meals: [{
                        id: 12
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