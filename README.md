# n8n-nodes-column

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Column, the Banking-as-a-Service platform. This node enables seamless integration with Column's full banking API, allowing you to build fintech applications with entity management, bank accounts, ACH/wire transfers, card issuing, lending, and more.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Column](https://img.shields.io/badge/Column-BaaS-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Features

- **Entity Management**: Create and manage person and business entities with full KYC/KYB verification
- **Bank Accounts**: Open checking and savings accounts with real-time balance tracking
- **ACH Transfers**: Send and receive ACH payments with same-day ACH support
- **Wire Transfers**: Domestic and international wire transfers with fee calculation
- **Book Transfers**: Instant internal transfers between Column accounts
- **Check Operations**: Issue checks, process deposits, and handle mobile deposits
- **Card Issuing**: Issue virtual and physical debit cards with spending controls
- **Lending**: Originate loans and lines of credit with payment scheduling
- **Webhooks**: Real-time event notifications for all banking activities
- **Sandbox Testing**: Full sandbox environment for development and testing

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-column`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the node
npm install n8n-nodes-column
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-column

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-column

# Restart n8n
n8n start
```

## Credentials Setup

### Column API Credentials

| Field | Description |
|-------|-------------|
| Environment | Select Production, Sandbox, or Custom |
| API Key | Your Column API key |
| Webhook Secret | (Optional) Secret for webhook signature verification |
| Platform ID | (Optional) Your Column platform ID |

### Column OAuth Credentials

| Field | Description |
|-------|-------------|
| Client ID | OAuth client ID |
| Client Secret | OAuth client secret |
| Environment | Production or Sandbox |

## Resources & Operations

### Entity

Manage person and business entities (bank customers).

| Operation | Description |
|-----------|-------------|
| Create Person | Create a new individual entity |
| Create Business | Create a new business entity |
| Get | Retrieve entity details |
| Update | Update entity information |
| List | List all entities |
| Archive | Archive an entity |
| Get Documents | Get entity's uploaded documents |
| Get Accounts | Get entity's bank accounts |
| Get Verification Status | Check KYC/KYB verification status |

### Bank Account

Manage bank accounts for entities.

| Operation | Description |
|-----------|-------------|
| Create | Open a new bank account |
| Get | Get account details |
| List | List all accounts |
| Close | Close an account |
| Get Balance | Get current balance |
| Get Account Number | Retrieve full account number |
| Get Routing Number | Get routing number |
| Get Statement | Generate account statement |
| Update | Update account settings |
| Get Limits | Get account limits |

### ACH Transfer

Handle ACH (Automated Clearing House) payments.

| Operation | Description |
|-----------|-------------|
| Create | Initiate an ACH transfer |
| Get | Get transfer details |
| List | List all ACH transfers |
| Cancel | Cancel a pending transfer |
| Get Return | Get return details |
| Handle Return | Process a return |
| Get NOC | Get Notification of Change |
| Create Same Day | Create same-day ACH |
| Get Limits | Get ACH limits |
| Get Window | Get processing windows |

### Wire Transfer

Send domestic and international wires.

| Operation | Description |
|-----------|-------------|
| Create Domestic | Send domestic wire |
| Create International | Send international wire |
| Get | Get wire details |
| List | List all wires |
| Cancel | Cancel pending wire |
| Get Status | Check wire status |
| Get Fees | Calculate wire fees |
| Get Cutoff Time | Get cutoff times |

### Book Transfer

Instant transfers between Column accounts.

| Operation | Description |
|-----------|-------------|
| Create | Create book transfer |
| Get | Get transfer details |
| List | List all transfers |
| Get Status | Check transfer status |

### Check

Issue checks and process deposits.

| Operation | Description |
|-----------|-------------|
| Issue | Issue a new check |
| Get | Get check details |
| List | List all checks |
| Void | Void a check |
| Stop Payment | Stop payment on check |
| Get Image | Get check image |
| Deposit | Process check deposit |
| Get Deposit | Get deposit details |
| Get Mobile Deposit | Get mobile deposit info |
| Get Deposit Status | Check deposit status |

### Counterparty

Manage external transfer recipients.

| Operation | Description |
|-----------|-------------|
| Create | Create counterparty |
| Get | Get counterparty details |
| Update | Update counterparty |
| Delete | Delete counterparty |
| List | List all counterparties |
| Verify | Verify counterparty |
| Get ACH Details | Get ACH routing info |

### Card

Issue and manage debit cards.

| Operation | Description |
|-----------|-------------|
| Create | Issue new card |
| Get | Get card details |
| List | List all cards |
| Activate | Activate card |
| Lock | Lock card |
| Unlock | Unlock card |
| Replace | Replace card |
| Close | Close card |
| Get PIN | Retrieve PIN |
| Reset PIN | Reset PIN |
| Get Transactions | Get card transactions |
| Set Limits | Set spending limits |

### Loan

Originate and manage loans.

| Operation | Description |
|-----------|-------------|
| Create | Originate loan |
| Get | Get loan details |
| List | List all loans |
| Update | Update loan |
| Get Balance | Get loan balance |
| Get Payment Schedule | View payment schedule |
| Make Payment | Make a payment |
| Get Transactions | Get loan transactions |
| Calculate Payoff | Calculate payoff amount |
| Charge Off | Charge off loan |

### Line of Credit

Manage revolving credit lines.

| Operation | Description |
|-----------|-------------|
| Create | Create credit line |
| Get | Get line details |
| Update Credit Limit | Modify credit limit |
| Draw | Draw from line |
| Make Payment | Make a payment |
| Get Available Credit | Check available credit |
| Get Transactions | Get line transactions |
| Close | Close credit line |

### Sandbox

Test operations in sandbox environment.

| Operation | Description |
|-----------|-------------|
| Simulate ACH Return | Simulate ACH return |
| Simulate ACH NOC | Simulate NOC |
| Simulate Wire Return | Simulate wire return |
| Simulate Check Deposit | Simulate check deposit |
| Simulate Card Transaction | Simulate card transaction |
| Advance Time | Advance sandbox time |
| Fund Account | Fund sandbox account |

## Trigger Node

The Column Trigger node listens for webhook events in real-time.

### Supported Events

- **Entity**: created, updated, archived, verification.completed, verification.failed
- **Account**: created, updated, closed, balance.changed, overdrawn
- **ACH**: created, submitted, completed, returned, canceled, noc_received
- **Wire**: created, submitted, completed, returned, canceled
- **Book Transfer**: created, completed
- **Check**: issued, mailed, cashed, voided, deposit.received, deposit.cleared, deposit.returned
- **Card**: created, activated, locked, unlocked, transaction
- **Loan**: created, funded, payment.received, payment.due, paid_off, delinquent
- **Transaction**: created, posted, reversed

## Usage Examples

### Create a Person Entity

```javascript
// Column node configuration
{
  "resource": "entity",
  "operation": "createPerson",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "dateOfBirth": "1990-01-15",
  "ssn": "123-45-6789",
  "address": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "US"
  }
}
```

### Open a Bank Account

```javascript
{
  "resource": "bankAccount",
  "operation": "create",
  "entityId": "ent_abc123",
  "accountType": "checking",
  "description": "Primary checking account"
}
```

### Send an ACH Transfer

```javascript
{
  "resource": "achTransfer",
  "operation": "create",
  "bankAccountId": "ba_xyz789",
  "counterpartyId": "cp_def456",
  "amount": 10000,  // $100.00 in cents
  "direction": "credit",
  "description": "Monthly payment"
}
```

### Issue a Debit Card

```javascript
{
  "resource": "card",
  "operation": "create",
  "bankAccountId": "ba_xyz789",
  "cardType": "virtual",
  "spendingLimits": {
    "daily": 100000,  // $1,000.00
    "monthly": 500000  // $5,000.00
  }
}
```

## Column Banking Concepts

### Entity
An Entity represents a bank customer - either a Person (individual) or Business (company). Entities must pass KYC (Know Your Customer) or KYB (Know Your Business) verification before opening accounts.

### Platform
A Platform is your fintech application registered with Column. Platforms can create entities and manage their accounts.

### Bank Account
Column offers checking and savings accounts with real routing and account numbers. Accounts can receive ACH, wires, and checks.

### Counterparty
A Counterparty represents an external bank account for transfers. Counterparties store routing and account numbers for outgoing payments.

### ACH Transfer
ACH (Automated Clearing House) is the US electronic payment network. ACH transfers typically settle in 1-2 business days, with same-day ACH available for faster settlement.

### Wire Transfer
Wire transfers are same-day, guaranteed payments. Domestic wires use Fedwire; international wires use SWIFT.

### Book Transfer
Book transfers move funds instantly between two Column accounts. No external rails are used, enabling real-time settlements.

### Hold
A Hold reserves funds in an account, reducing available balance while preserving ledger balance. Used for pending transactions and authorizations.

## Error Handling

The node handles common Column API errors:

| Error Code | Description | Handling |
|------------|-------------|----------|
| 400 | Bad Request | Check input parameters |
| 401 | Unauthorized | Verify API credentials |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource IDs |
| 409 | Conflict | Duplicate request or state conflict |
| 422 | Unprocessable | Validation failed |
| 429 | Rate Limited | Implement backoff strategy |

## Security Best Practices

1. **API Keys**: Never expose API keys in logs or error messages
2. **PII Handling**: Follow GLBA requirements for financial data
3. **Webhook Verification**: Always verify webhook signatures
4. **Idempotency**: Use idempotency keys for critical operations
5. **Audit Trail**: Log all financial transactions
6. **Encryption**: All data transmitted over TLS 1.2+

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use

Permitted for personal, educational, research, and internal business use.

### Commercial Use

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Support

- **Documentation**: [Column API Docs](https://column.com/docs)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-column/issues)
- **Email**: support@velobpa.com

## Acknowledgments

- [Column](https://column.com) for their excellent Banking-as-a-Service platform
- [n8n](https://n8n.io) for the powerful workflow automation platform
- The n8n community for their support and feedback
