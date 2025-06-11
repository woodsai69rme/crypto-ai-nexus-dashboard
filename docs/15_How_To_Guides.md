
# How-To Guides - CryptoMax

## Trading Guides

### How to Place Your First Trade

#### Prerequisites
- Verified CryptoMax account
- Completed profile setup
- Familiarized with dashboard layout

#### Step-by-Step Instructions

1. **Navigate to Trading Interface**
   - Click on any cryptocurrency from the market data table
   - Or use the search bar to find specific coins
   - Click the "Trade" button

2. **Choose Order Type**
   ```
   Market Order: Executes immediately at current market price
   Limit Order: Executes only when price reaches your target
   Stop-Loss: Automatically sells to limit losses
   ```

3. **Configure Your Order**
   - **Side**: Choose Buy or Sell
   - **Quantity**: Enter amount in AUD or crypto units
   - **Price**: Set target price (for limit orders)
   - **Stop Price**: Set stop-loss level (optional)

4. **Review Order Details**
   - Verify all parameters
   - Check estimated fees (0.1-0.25%)
   - Confirm available balance

5. **Execute the Trade**
   - Click "Review Order"
   - Confirm order details
   - Click "Place Order"
   - Monitor execution status

#### Tips for Success
- Start with small amounts to learn
- Use limit orders for better price control
- Always set stop-losses for risk management
- Monitor market conditions before trading

### How to Set Up Dollar Cost Averaging (DCA)

#### What is DCA?
Dollar Cost Averaging reduces the impact of volatility by investing fixed amounts at regular intervals, regardless of price.

#### Setting Up DCA Bot

1. **Access AI Bots Section**
   - Navigate to "AI Bots" from main menu
   - Click "Create New Bot"
   - Select "Dollar Cost Averaging"

2. **Configure DCA Parameters**
   ```
   Bot Name: "Bitcoin DCA Weekly"
   Target Cryptocurrency: BTC
   Investment Amount: $100 AUD
   Frequency: Weekly (every Monday)
   Duration: 6 months
   ```

3. **Set Risk Management**
   - **Maximum Position**: $2,500 AUD (25 weeks × $100)
   - **Stop Loss**: 20% portfolio decline
   - **Take Profit**: Optional (not recommended for DCA)

4. **Review and Activate**
   - Verify all settings
   - Check required balance
   - Activate bot in paper trading mode first

#### DCA Best Practices
- Choose well-established cryptocurrencies (BTC, ETH)
- Invest amounts you can afford consistently
- Don't stop during market downturns
- Review and adjust quarterly

### How to Use Grid Trading Strategy

#### Understanding Grid Trading
Grid trading places buy and sell orders at regular price intervals, profiting from market volatility.

#### Setup Process

1. **Analyze Price Range**
   - Identify support level: $60,000 (BTC example)
   - Identify resistance level: $70,000
   - Calculate range: $10,000

2. **Configure Grid Parameters**
   ```
   Grid Levels: 10
   Price Interval: $1,000 ($10,000 ÷ 10)
   Investment per Level: $200 AUD
   Total Investment: $2,000 AUD
   ```

3. **Set Grid Orders**
   - Buy orders: $60,000, $61,000, $62,000... $69,000
   - Sell orders: $61,000, $62,000, $63,000... $70,000
   - Each order: $200 AUD worth

4. **Monitor and Adjust**
   - Track filled orders
   - Adjust range if price breaks out
   - Take profits when range is exhausted

#### Grid Trading Tips
- Works best in sideways markets
- Requires active monitoring
- Consider transaction fees in calculations
- Have exit strategy for strong trends

## Portfolio Management Guides

### How to Build a Balanced Crypto Portfolio

#### Portfolio Allocation Framework

**Conservative Portfolio (Low Risk)**
```
Core Holdings (70%):
- Bitcoin (BTC): 40%
- Ethereum (ETH): 30%

Growth Holdings (25%):
- Solana (SOL): 10%
- Cardano (ADA): 8%
- Polygon (MATIC): 7%

Speculative Holdings (5%):
- Emerging altcoins: 5%
```

**Moderate Portfolio (Medium Risk)**
```
Core Holdings (60%):
- Bitcoin (BTC): 35%
- Ethereum (ETH): 25%

Growth Holdings (30%):
- Solana (SOL): 10%
- Cardano (ADA): 8%
- Polygon (MATIC): 7%
- Chainlink (LINK): 5%

Speculative Holdings (10%):
- DeFi tokens: 5%
- New projects: 5%
```

**Aggressive Portfolio (High Risk)**
```
Core Holdings (40%):
- Bitcoin (BTC): 25%
- Ethereum (ETH): 15%

Growth Holdings (40%):
- Top 10 altcoins: 40%

Speculative Holdings (20%):
- Small-cap altcoins: 15%
- New launches: 5%
```

#### Implementation Steps

1. **Determine Risk Tolerance**
   - Assess financial situation
   - Consider investment timeline
   - Evaluate market experience

2. **Calculate Position Sizes**
   ```
   Total Portfolio: $10,000 AUD
   BTC Allocation (35%): $3,500 AUD
   ETH Allocation (25%): $2,500 AUD
   SOL Allocation (10%): $1,000 AUD
   ```

3. **Execute Purchases**
   - Start with core holdings first
   - Use DCA for large positions
   - Spread purchases over time

4. **Set Rebalancing Schedule**
   - Monthly review for active traders
   - Quarterly review for long-term holders
   - Rebalance when allocation drifts 5%+

### How to Rebalance Your Portfolio

#### When to Rebalance
- Allocation drifts 5%+ from target
- Monthly or quarterly schedule
- After major market movements
- When investment thesis changes

#### Rebalancing Process

1. **Calculate Current Allocation**
   ```
   Current Portfolio: $12,000 AUD
   BTC: $5,000 (41.7%) - Target: 35%
   ETH: $3,500 (29.2%) - Target: 25%
   SOL: $1,500 (12.5%) - Target: 10%
   Others: $2,000 (16.7%) - Target: 30%
   ```

2. **Identify Deviations**
   - BTC: Overweight by 6.7% (+$800 AUD)
   - ETH: Overweight by 4.2% (+$500 AUD)
   - SOL: Overweight by 2.5% (+$300 AUD)
   - Others: Underweight by 13.3% (-$1,600 AUD)

3. **Execute Rebalancing Trades**
   - Sell overweight positions
   - Buy underweight positions
   - Consider tax implications
   - Use limit orders for better prices

4. **Verify New Allocation**
   - Confirm target percentages achieved
   - Document rebalancing decisions
   - Set next review date

### How to Calculate Portfolio Performance

#### Key Performance Metrics

**Total Return**
```
Total Return = (Current Value - Initial Investment) / Initial Investment × 100
Example: ($12,000 - $10,000) / $10,000 × 100 = 20%
```

**Annualized Return**
```
Annualized Return = (Current Value / Initial Investment)^(1/Years) - 1
Example: ($12,000 / $10,000)^(1/0.5) - 1 = 44%
```

**Maximum Drawdown**
```
Max Drawdown = (Peak Value - Trough Value) / Peak Value × 100
Example: ($12,000 - $8,000) / $12,000 × 100 = 33.3%
```

#### Performance Tracking

1. **Document All Transactions**
   - Date and time of each trade
   - Cryptocurrency and quantity
   - Price and fees paid
   - Total cost or proceeds

2. **Calculate Holdings Value**
   - Track current quantity of each asset
   - Multiply by current market price
   - Sum total portfolio value

3. **Monitor Key Ratios**
   - **Sharpe Ratio**: Return per unit of risk
   - **Win Rate**: Percentage of profitable trades
   - **Average Gain/Loss**: Size of typical wins/losses

4. **Compare to Benchmarks**
   - Bitcoin performance
   - Total crypto market index
   - Traditional investment benchmarks

## AI Bot Guides

### How to Monitor Bot Performance

#### Key Performance Indicators

**Profitability Metrics**
- **Total Return**: Overall profit/loss percentage
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Largest loss from peak
- **Win Rate**: Percentage of profitable trades

**Activity Metrics**
- **Total Trades**: Number of completed transactions
- **Average Trade Size**: Typical position size
- **Trading Frequency**: Trades per day/week
- **Active Days**: Days with trading activity

#### Performance Analysis Dashboard

1. **Access Bot Analytics**
   - Navigate to AI Bots section
   - Click on specific bot name
   - Select "Performance" tab

2. **Review Performance Charts**
   - Cumulative returns over time
   - Drawdown periods and recovery
   - Trade distribution histogram
   - Profit/loss by time period

3. **Analyze Trade History**
   - Individual trade details
   - Entry and exit prices
   - Hold duration and returns
   - Fee impact on profitability

4. **Compare to Benchmarks**
   - Bot vs. buy-and-hold strategy
   - Bot vs. market performance
   - Bot vs. other trading strategies

#### Optimization Guidelines

**When to Adjust Bot Settings**
- Consistent underperformance (>30 days)
- Maximum drawdown exceeded
- Market conditions change significantly
- Strategy assumptions invalidated

**Common Adjustments**
- Position size modifications
- Stop-loss level changes
- Take-profit target updates
- Trading frequency adjustments

### How to Create Custom Trading Strategies

#### Strategy Development Process

1. **Define Strategy Logic**
   ```
   Example: Mean Reversion Strategy
   - Buy when price is 10% below 20-day moving average
   - Sell when price returns to moving average
   - Stop loss at 5% below entry price
   - Maximum position size: 10% of portfolio
   ```

2. **Set Entry Conditions**
   - Technical indicators (RSI, MACD, Moving Averages)
   - Price action patterns
   - Volume requirements
   - Market sentiment filters

3. **Define Exit Rules**
   - Take profit targets
   - Stop loss levels
   - Time-based exits
   - Trailing stop mechanisms

4. **Configure Risk Management**
   - Position sizing rules
   - Maximum daily losses
   - Correlation limits
   - Exposure restrictions

#### Backtesting Your Strategy

1. **Historical Data Analysis**
   - Select test period (minimum 1 year)
   - Use clean, tick-level data
   - Include all costs and slippage
   - Test across different market conditions

2. **Performance Evaluation**
   - Calculate all performance metrics
   - Compare to buy-and-hold benchmark
   - Analyze worst-case scenarios
   - Validate statistical significance

3. **Strategy Refinement**
   - Optimize parameters carefully
   - Avoid overfitting to historical data
   - Test on out-of-sample data
   - Consider regime changes

## Security Guides

### How to Secure Your Account

#### Multi-Factor Authentication Setup

1. **Enable 2FA**
   - Go to Settings → Security
   - Click "Enable Two-Factor Authentication"
   - Choose authentication method:
     - Authenticator app (recommended)
     - SMS verification
     - Email verification

2. **Authenticator App Setup**
   - Download Google Authenticator or Authy
   - Scan QR code with app
   - Enter verification code
   - Save backup codes securely

3. **Test 2FA**
   - Log out of your account
   - Log back in using email/password + 2FA code
   - Verify successful authentication

#### Password Security Best Practices

**Strong Password Criteria**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Unique to CryptoMax (not reused)
- No personal information
- Updated every 3-6 months

**Password Manager Usage**
- Use reputable password manager
- Generate unique passwords for each service
- Enable password manager 2FA
- Regular backup of password vault

#### Account Monitoring

1. **Regular Security Checkups**
   - Review login history monthly
   - Check for unfamiliar devices/locations
   - Verify all account changes
   - Monitor email for security alerts

2. **Enable Account Notifications**
   - Login from new device
   - Password changes
   - Email address changes
   - Large transactions or withdrawals

### How to Protect Against Phishing

#### Recognizing Phishing Attempts

**Common Warning Signs**
- Urgent language ("Act now or lose access")
- Generic greetings ("Dear customer")
- Suspicious sender addresses
- Requests for passwords or private keys
- Links to suspicious domains

**Verification Steps**
1. Check sender email address carefully
2. Hover over links without clicking
3. Look for spelling/grammar errors
4. Verify through official channels
5. Never enter credentials from email links

#### Safe Browsing Practices

1. **Always Type URL Directly**
   - Type "cryptomax.lovable.app" in browser
   - Use bookmarks for frequently visited sites
   - Never click links in emails or messages

2. **Verify Website Security**
   - Check for "https://" and lock icon
   - Verify correct domain name
   - Look for official security certificates

3. **Keep Software Updated**
   - Update browser regularly
   - Install security patches promptly
   - Use reputable antivirus software

## Troubleshooting Guides

### How to Resolve Login Issues

#### Common Login Problems and Solutions

**Forgotten Password**
1. Click "Forgot Password" on login page
2. Enter your registered email address
3. Check inbox for reset email (including spam)
4. Click reset link and create new password
5. Log in with new credentials

**Email Not Verified**
1. Check spam/junk folder for verification email
2. Add noreply@cryptomax.com.au to contacts
3. Request new verification email
4. Click verification link within 24 hours

**2FA Code Not Working**
1. Ensure device time is synchronized
2. Generate new code in authenticator app
3. Try backup codes if available
4. Contact support for 2FA reset

**Account Locked**
1. Check email for security notifications
2. Wait 30 minutes for automatic unlock
3. Contact support if still locked
4. Verify identity for manual unlock

#### Browser-Specific Issues

**Cache and Cookies**
1. Clear browser cache and cookies
2. Disable browser extensions temporarily
3. Try incognito/private browsing mode
4. Update browser to latest version

**JavaScript Disabled**
1. Enable JavaScript in browser settings
2. Add CryptoMax to allowed sites
3. Disable ad blockers temporarily
4. Refresh page after changes

### How to Fix Trading Issues

#### Order Execution Problems

**Order Not Filling**
- Check if market is open (crypto markets are 24/7)
- Verify order price is realistic for market conditions
- Ensure sufficient balance for order + fees
- Consider using market order instead of limit order

**Incorrect Order Price**
- Double-check decimal places in order entry
- Verify currency denomination (AUD vs USD)
- Consider market volatility and slippage
- Use limit orders for precise pricing

**Insufficient Balance Error**
- Check available balance vs. total order value
- Account for trading fees (0.1-0.25%)
- Verify no pending orders using funds
- Contact support if balance appears incorrect

#### Portfolio Calculation Issues

**Incorrect Portfolio Value**
1. Refresh page to update prices
2. Check for delayed market data
3. Verify all positions are displaying
4. Recalculate manually if needed

**Missing Transactions**
1. Check transaction history for all trades
2. Verify trade confirmation emails
3. Contact support with transaction details
4. Provide screenshots if available

### How to Contact Support

#### Self-Service Options

1. **Help Center Search**
   - Use specific keywords for your issue
   - Browse categories for related topics
   - Check FAQ for common questions
   - Review video tutorials

2. **Community Forum**
   - Search existing discussions
   - Post detailed questions
   - Help other users when possible
   - Follow community guidelines

#### Direct Support Channels

**Live Chat (Preferred)**
- Available: 9 AM - 6 PM AEST
- Response time: Under 5 minutes
- Best for: Urgent technical issues
- Access: Click chat icon in bottom right

**Email Support**
- Address: support@cryptomax.com.au
- Response time: Within 24 hours
- Best for: Detailed technical issues
- Include: Screenshots, error messages, account details

**Priority Support** (Pro/Enterprise users)
- Dedicated support queue
- Response time: Under 2 hours
- Direct phone support available
- Account manager for Enterprise users

#### When Contacting Support

**Information to Include**
- Account email address
- Description of issue
- Steps taken to resolve
- Screenshots or error messages
- Browser and device information
- Time and date of issue

**Response Expectations**
- Acknowledgment within 2 hours
- Initial response within 24 hours
- Resolution timeline provided
- Follow-up until issue resolved

---

*For additional guides and tutorials, visit our [Knowledge Base](https://help.cryptomax.com.au) or watch our [Video Tutorial Series](https://youtube.com/cryptomax).*
