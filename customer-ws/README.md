## Gateway Customer
### Produce

#### get_coursier_geoloc

```json
{
    orderId: "uuid",
    geoloc: {
        lat: 12,
        long: 32
    }
}
```
#### add_feeback
```json
{
    mealId: "uuid",
    rating: 4,
    customerId: "uuid",
    desc: "Plat de très bonne qualité"
}
```
#### list_meals
```json
{
    categories: ["asiatique","kebab"],
    restaurants: ["mac do","L'Artdoise"]
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
            type:"dessert",
            price: 1.0,
            eta: 4,
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
    },
    voucher: "AZERTY"
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
                type:"main course",
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
#### price_computed
#### eta_result
#### order_tracker


