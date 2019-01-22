# Extend description of Bittrex API

## Scenario Buy Currency
    Form filled:
      MarketName: BTC-ANT / BUY ARAGON
      Units:  4.50911974 
      Bid:    0.00020400
      Total:  0.00092216

    Description in popup:
      Type:           Limit Buy
      Market:         BTC-ANT
      Time In Force:  Good 'Til Cancelled (Default)
      Quantity:       4.50911974 ANT
      Price:          0.00020400 BTC
      Subtotal:       0.00091986 BTC
      Commission:     0.00000230 BTC
      Total:          0.00092216 BTC  
      
      
   **CREATE ORDER**  
       
    Http Request:
      MarketName=BTC-ANT
      OrderType=LIMIT
      Quantity=4.50911974
      Rate=0.00020400
      TimeInEffect=GOOD_TIL_CANCELLED
      ConditionType=NONE
      Target=0

    Http Response 
   ```json
      {
        "success": true,
        "message": "",
        "result": {
          "OrderId": "06beadc3-9f40-4a14-a37c-c528326a5939",
          "MarketName": "BTC-ANT",
          "MarketCurrency": "ANT",
          "BuyOrSell": "Buy",
          "OrderType": "LIMIT",
          "Quantity": 4.50911974,
          "Rate": 0.00020400
        }
      }
   ``` 
   
   **GET OPEN ORDER**
   
   **CHECK ORDER**
     
    Http Response @todo Should implement
   ```json
      {
      }
   ```    
   
 

## Scenario Sell Currency
    Form filled:
      MarketName: BTC-ANT / SELL ARAGON
      Units: 3.62528619 (ANT exists)
      Price: 100
      Total: 361.62229745 (BTC calculating as Units * Price)
    
    Description in popup:
      Limit Sell
      Type:           Limit Sell
      Market:         BTC-ANT
      Time In Force:  Good 'Til Cancelled (Default)
      Quantity:       3.62528619    ANT
      Price:          100.00000000  BTC
      Subtotal:       362.52861900  BTC
      Commission:     0.90632155    BTC
      Total:          361.62229745  BTC  
       
    Http Request:
      MarketName=BTC-ANT
      OrderType=LIMIT
      Quantity=3.62528619
      Rate=100.00000000
      TimeInEffect=GOOD_TIL_CANCELLED
      ConditionType=NONE
      Target=0         
      
    Http Request: ERROR  
    
    Http Request:
      MarketName=BTC-ANT
      OrderType=LIMIT
      Quantity=3.62528619
      Rate=0.00039331
      TimeInEffect=GOOD_TIL_CANCELLED
      ConditionType=NONE
      Target=0
      
    Http Response 
   ```json
      {
        "success": true,
        "message": "",
        "result": {
          "OrderId": "a704b9d2-5de3-4b56-b630-ea5565d345f3",
          "MarketName": "BTC-ANT",
          "MarketCurrency": "ANT",
          "BuyOrSell": "Sell",
          "OrderType": "LIMIT",
          "Quantity": 3.62528619,
          "Rate": 0.00039331
        }
      }
   ```           


## Cancel order

**Request**:
`https://bittrex.com/api/v1.1/market/cancel?uuid=a382d755-3bef-4fef-9719-f172f5174fde`

**Responses**:

If Success:

```
  @todo Need to add
```

If Error:

```
  @todo Need to add
```


## Check order

**Request**:
`https://bittrex.com/api/v1.1/account/getorder&uuid=0cb4c4e4-bdc7-4e13-8c13-430e587d2cc1`  
  
**Responses**:

Data about order (tradesell):
```json
{ "AccountI": null,
  "OrderUuid": "c4b150e2-a2ab-4c34-8147-9693e993571f",
  "Exchange": "BTC-ETH",
  "Type": "LIMIT_SELL",
  "Quantity": 0.16823593,
  "QuantityRemaining": 0.16823593,
  "Limit": 1,
  "Reserved": 0.16823593,
  "ReserveRemaining": 0.16823593,
  "CommissionReserved": 0,
  "CommissionReserveRemaining": 0,
  "CommissionPaid": 0,
  "Price": 0,
  "PricePerUnit": null,
  "Opened": "2018-01-19T14:13:41.707",
  "Closed": null,
  "IsOpen": true,
  "Sentinel": "45680752-8ae7-4977-b957-53af8d290bf3",
  "CancelInitiated": false,
  "ImmediateOrCancel": false,
  "IsConditional": false,
  "Condition": "NONE",
  "ConditionTarget": null 
}
```

If order not found: 

```json
  {
    "success":true,
    "message":"",
    "result":null
  }
```     

## Trade Buy

**Request**:
```
 MarketName:BTC-ETH
 OrderType:LIMIT
 Quantity:0.00000044
 Rate:0.09160227
 TimeInEffect:GOOD_TIL_CANCELLED
 ConditionType:NONE
 Target:0
```

**Responses**:

If minimum trade value less then exists:

```json
  {
    "success":false,
    "message":"MIN_TRADE_REQUIREMENT_NOT_MET",
    "result": null
  }
```

## Trade Sell

**Request**:
```
 MarketName:BTC-ETH
 OrderType:LIMIT
 Quantity:0.16823593
 Rate:1.00000000
 TimeInEffect:GOOD_TIL_CANCELLED
 ConditionType:NONE
 Target:0
```

**Responses**:

If order was create:

```json
  {
    "success":true,
    "message":"",
    "result":{
        "OrderId":"701da2f6-2322-4200-a9d4-a4a4dbe395d2",
        "MarketName":"BTC-ETH",
        "MarketCurrency":"ETH",
        "BuyOrSell":"Sell",
        "OrderType":"LIMIT",
        "Quantity":0.16823593,
        "Rate":1.00000000
      }
  }
```

If Quantity less then exists:

```json
  {
    "success":false,
    "message":"INSUFFICIENT_FUNDS",
    "result": null
  }
```
