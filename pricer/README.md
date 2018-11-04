
## Pricer
### Produce
#### price_computed
```json
{
    orderId: "69",
    price: 21
}
```
#### vouchers_listed
```json
{
    resturantId: "42",
    vouchers: [
        {
            restaurantId: "42",
            code: "AZERTYUIOP",
            discount: 0.2, // -20%
            expirationDate: 07/11/1996 ISO
        },{
            restaurantId: "42",
            code: "QSDFGHJ",
            discount: 0.6, // -60%
            expirationDate: 07/11/2000 ISO
        }
    ]
}
```
### Consume
#### create_order
#### add_voucher
#### list_vouchers
