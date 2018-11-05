## Gateway Customer
### Produce

#### get_coursier_geoloc

```json
{
    orderId: 12
}
```
#### add_feeback
```json
{
    mealId: 12,
    rating: 4,
    customerId: 15,
    desc: "Franchement c'est le feu mais c un arabe qui m'a servi"
}
```
#### list_meals
```json
{
    categories: ["asiatique","kebab"],
    restaurants: ["mac do","la frite a Bernard"]
}
```
#### create_order_request
```json
{
    timestamp: 182038333,
    meals: [
        {
            id: 34,
            name: "Mac fist",
            category: "burger",
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
        address : "3 Privet Drive",
    }
}
```
#### submit_order
```json
{
    timestamp:1234,
    order: {
        id: "uuid",
        meals: [
            {
                id: 34,
                name: "Mac fist",
                category: "burger",
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
    },
    creditCard: {
        name: "Balotelli",
        number: 5131637836475957374,
        ccv: 753,
        limit: "07/19"
    } // Ou pas
}
```


### Consume
#### meals_listed
#### eta_result
#### order_tracker