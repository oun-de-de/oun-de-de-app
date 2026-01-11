# Software Requirements Specification (SRS)
## Functional Requirements

---

## FR-1: Vehicle Weight In–Out Recording

**Description:**  
The system shall record vehicle weight for ice purchasing transactions using trucks and Tuk Tuks.

**Requirements:**
- The system shall record **weight-in** for each truck or Tuk Tuk entering the weighing process.
- The system shall record **weight-out** for each truck or Tuk Tuk after ice loading.
- The system shall calculate the **net ice weight** based on weight-in and weight-out.
- The system shall support the following vehicle types:
  - Truck
  - Tuk Tuk

---

## FR-2: Customer Identification by License Plate

**Description:**  
The system shall identify customers based on vehicle license plates during ice purchasing.

**Requirements:**
- The system shall identify the customer using the **vehicle license plate number**.
- The system shall match the license plate against the **customer list**.
- The system shall automatically assign the customer name to the transaction when a match is found.
- If the license plate is not found, the system shall allow manual customer selection or registration.

---

## FR-3: Customer List and Vehicle Type Management

**Description:**  
The system shall manage a customer list associated with license plates and vehicle types.

**Requirements:**
- The system shall allow users to **create, update, and delete** customer records.
- Each customer record shall include:
  - Customer name
  - License plate number
  - Vehicle type (Truck or Tuk Tuk)
- The system shall ensure that each license plate is uniquely assigned to one customer.
- The system shall classify customers as **Truck customers** or **Tuk Tuk customers**.

---

## FR-4: Bag Weight Configuration

**Description:**  
The system shall support dividing ice into standard bag weights.

**Requirements:**
- The system shall support **standard bag weights** of **19 kg** and **20 kg**.
- The system shall use bag weight values for ice packaging and sales calculations.

---

## FR-5: Customer-Specific Product Bag Weight Configuration

**Description:**  
The system shall manage bag weight configurations per product based on the customer name list.

**Requirements:**
- The system shall allow users to define **bag weight configurations per product and per customer**.
- The system shall associate **customer name**, **product**, and **bag weight** in the configuration.
- Different customers may have different bag weight configurations for the same product.
- If no customer-specific configuration exists, the system shall apply a **default bag weight** for the product.

---

## FR-6: Bag Quantity Calculation

**Description:**  
The system shall calculate the number of ice bags based on the configured bag weight.

**Requirements:**
- The system shall calculate the **number of bags** using:
  - Net ice weight
  - Applied bag weight (19 kg or 20 kg)
- The system shall prevent calculation using unsupported bag weight values.

---

## FR-7: Selling Price Configuration per Product and Customer

**Description:**  
The system shall manage selling prices per product based on the customer name list.

**Requirements:**
- The system shall support selling prices ranging from **1,800 Riel to 2,100 Riel per bag**.
- The system shall allow users to define **selling price configurations per product and per customer**.
- The system shall associate **customer name**, **product**, and **selling price** in the price list.
- Different customers may have different selling prices for the same product, depending on purchase volume.

---

## FR-8: Automatic Application of Bag Weight and Price

**Description:**  
The system shall automatically apply the correct bag weight and selling price during transactions.

**Requirements:**
- The system shall retrieve the **customer-specific bag weight** for the selected product.
- The system shall retrieve the **customer-specific selling price** for the selected product.
- The system shall use the applied bag weight and price to calculate:
  - Number of bags
  - Total selling amount

---

## FR-9: Automatic Ice Weighing Software Integration

**Description:**  
The system shall integrate with the automatic ice weighing software connected to the truck scale.

**Requirements:**
- The system shall automatically receive weight data from the truck scale.
- The system shall use automatic weighing data for:
  - Vehicle weight in–out
  - Bag weight calculation
  - Ice sales transactions
- The system shall minimize manual data entry when automatic weighing is available.

---

## FR-10: Weighing Transaction Data Storage

**Description:**  
The system shall store all weighing and transaction information after completion.

**Requirements:**
- The system shall save the following data for each completed transaction:
  - Customer name
  - Vehicle number (license plate)
  - Product code
  - Gross weight, tare weight, net weight
  - Bag weight
  - Number of bags
  - Selling price per bag
  - Transaction date and time
  - Driver name
  - Weighing staff name

---

## FR-11: Sales Invoice Issuance by Billing Period

**Description:**  
The system shall issue sales invoices to customers based on defined billing periods.

**Requirements:**
- The system shall support issuing sales invoices according to the following billing periods:
  - One day
  - One week
  - Two weeks
  - One month
- The system shall generate invoices automatically based on completed weighing and sales transactions within the selected billing period.

---

## FR-12: Standard Invoice Format

**Description:**  
The system shall use a single, standard invoice format for all billing periods.

**Requirements:**
- The system shall use the **same invoice format** for all billing periods (one day, one week, two weeks, one month).
- The system shall generate invoices in **Excel format**.
- The system shall support **paper printing formats**:
  - A4
  - A5
- The invoice format shall include detailed information, including but not limited to:
  - Export Data's Date
  - Customer name
  - Date
  - REF No
  - Memo
  - ...

---

## FR-13: Customer Billing Period Management

**Description:**  
The system shall manage customer billing periods for invoice issuance.

**Requirements:**
- The accounting software shall manage customer lists based on billing periods:
  - Daily
  - Weekly
  - Bi-weekly
  - Monthly
- The system shall not require any additional billing conditions beyond the defined periods.
- The system shall associate each customer with one of the supported billing periods.

---

## FR-14: Customer List Management with User Rights

**Description:**  
The system shall allow authorized users to manage customer billing lists.

**Requirements:**
- The system shall allow authorized users to **create and edit customer billing lists**.
- Customer billing lists shall be manageable from:
  - Truck scale software
  - Accounting software
- The system shall enforce **user access rights** for creating and editing customer billing information.

---

## FR-15: Automatic Data Saving for Reporting

**Description:**  
The system shall automatically save invoice and sales data for reporting purposes.

**Requirements:**
- The system shall automatically save all invoice data into the accounting software.
- The system shall store invoice data in a structured format suitable for reporting.
- The system shall ensure that saved data can be used for financial and operational reports.

---

## FR-16: Customer Credit Purchase with Monthly Installments (Ice Purchase)

**Description:**  
The system shall support customers purchasing ice on credit with monthly installment payments.

**Requirements:**
- The system shall allow customers to **borrow money to purchase ice**.
- The system shall support **monthly installment repayment** for customer credit purchases.
- The system shall generate credit purchase records in **Excel format**.
- The system shall support **paper printing formats**:
  - A4
  - A5
- The credit purchase format shall include detailed information, including:
  - Customer name
  - Vehicle type (Truck or Tuk Tuk)
  - Credit amount
  - Installment amount
  - Installment period
  - Outstanding balance
  - Transaction date
  - ...
- The system shall automatically save all credit and installment information into the **accounting software** for reporting.

---

## FR-17: Credit Limit Monitoring and Reminder Notification

**Description:**  
The system shall monitor customer credit limits and provide reminder notifications when limits are exceeded.

**Requirements:**
- The system shall enforce the following **credit limits**:
  - Tuk Tuk customers: **1,000,000 Riel**
  - Truck customers: **2,000,000 Riel**
- If a customer’s borrowed amount exceeds the prescribed limit, the system shall display a **yellow reminder notice**.
- The system shall associate credit limits with the customer’s vehicle type.
- Credit limit status shall be saved into the accounting software for reporting.

---

## FR-18: Customer Loan for Equipment Purchase with Monthly Installments

**Description:**  
The system shall support customer loans for purchasing assets such as trucks or ice cabinets.

**Requirements:**
- The system shall allow customers to **borrow money to purchase trucks or ice cabinets**.
- The system shall support **monthly installment repayment** for these loans.
- The system shall generate loan records in **Excel format**.
- The system shall support **paper printing formats**:
  - A4
  - A5
- Loan records shall include detailed information, including:
  - Customer name
  - Loan purpose (Truck / Ice Cabinet)
  - Loan amount
  - Installment amount
  - Installment period
  - Outstanding balance
  - ...
- All loan information shall be automatically saved into the accounting software for reporting.

---

## FR-19: Staff Loan Management with Monthly Installments

**Description:**  
The system shall manage staff loans with monthly installment repayment.

**Requirements:**
- The system shall allow staff members to **borrow money**.
- The system shall support **monthly installment repayment** for staff loans.
- The system shall generate staff loan records in **Excel format**.
- The system shall support **paper printing formats**:
  - A4
  - A5
- Staff loan records shall include:
  - Staff name
  - Loan amount
  - Installment amount
  - Installment period
  - Outstanding balance
  - ...
- The system shall automatically save all staff loan data into the accounting software for reporting.

---

## FR-20: Bag In–Out Stock Control

**Description:**  
The system shall manage bag inventory movement for ice packaging operations.

**Requirements:**
- The system shall provide a format for **purchasing input bags from suppliers**.
- The system shall provide a format for **exporting bags from the warehouse to the on-site ice factory**.
- The system shall support **paper formats**:
  - A4
  - A5
- Bag stock records shall include:
  - Supplier name
  - Quantity in
  - Quantity out
  - Transaction date
  - Warehouse / location
  - ...
- The system shall automatically save bag stock data into the accounting software for reporting.

---

## FR-21: Equipment Stock Management for Customer Borrowing

**Description:**  
The system shall manage equipment inventory that customers can borrow.

**Requirements:**
- The system shall provide a format for **purchasing input equipment**.
- The system shall provide a format for **customers borrowing equipment**.
- The system shall provide a format for **customers returning equipment**.
- The system shall support **paper formats**:
  - A4
  - A5
- Equipment records shall include:
  - Equipment name
  - Serial number
  - Customer name
  - Borrow date
  - Return date
  - Equipment status
  - ...
- The system shall automatically save equipment data into the accounting software for reporting.

---

## FR-22: Financial Management and Reporting

**Description:**  
The system shall support financial reporting for income, profit, and balance sheet management.

**Requirements:**
- The system shall generate a **monthly income statement**.
- The system shall generate a **monthly profit statement**.
- The system shall generate a **monthly balance sheet statement**.
- The system shall provide **sample formats** for all financial statements.
- All financial data shall be automatically saved into the accounting software for reporting and auditing.

---
