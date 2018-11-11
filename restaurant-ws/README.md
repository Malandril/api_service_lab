
## Gateway Restaurateur

### Produce
#### get_statistics
```json
{
    restaurantId: "id"
}
```
#### list_feedback

```json
{
    restaurantId : "id"
}
```

#### get_meals
```json
{
    restaurantId : "id",
    status: "todo" // | "cooked" | "delivered"
}
```
#### meal_cooked
```json
{
    timestamp:1540219618,
    order: {
        id: 12
    }
}
```
#### add_voucher
```json
{
    restaurantId: "42",
    code: "AZERTYUIOP",
    discount: 0.2, // -20%
    expirationDate: 07/11/1996 ISO
}
```
#### list_vouchers
```json
{
    restaurantId: "42"
}
```

### Consume
#### meals_getted
#### order_delivered
#### statistics
#### vouchers_listed
#### feedback_listed