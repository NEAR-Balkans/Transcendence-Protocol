
### AlchemistV2 Harvest

When the `harvest` function is called by the keeper, the function harvests any available yield in the yield protocol for the token supplied. The amount of yield harvested (if available) is converted to credit amount which will be eventually distributed to all the users of the protocol. The credit distribution is not a transfer of asset, rather, it is a deduction on the debt balance of all the users in the protocol.

  

The process of distributing credit for a yield token involves the following:

*   The unlocked credit amount is recalculated, using the previous pending credit (if any)
    
*   The calculated unlocked credit is then used to calculate the accrued weight and the new accrued weight is added to the previous accrued weight. The accrued weight is amount of credit available to the users of the protocol, and the user's portion of the accrued weight depends on how much debt they have and how much yield their collateral has generated.
    

  

Loan Repayment

Loan repayment is done using unlocked credits that have been accumulated from the generated yield. This happens in two steps:

*   Calling the `_distributeUnlockedCreditDeposited` function. This functions simply recalculates the unlock credit and updates the accrued weights accordingly, per yield token.
    
*   The next step is calling the `_poke` function. The poke function uses the accrued weights and the yield token balance of the user to calculate the unrealized credit of the user. The result of the unrealized credit is then deducted from the user's debt, thereby reducing the amount of debt the user has on the platform. This is how the user's debt is repaid. These two functions are called in the most of the key functions in the contract.
    

There is also an external `poke` function that can be called by only whitelisted contracts and externally owned accounts. This function will repay the loans of the caller by performing the following steps:

*   Harvest available yield
    
*   Distribute unlocked credit
    
*   Pay credit to the user's account using the `_poke` function already explained above.