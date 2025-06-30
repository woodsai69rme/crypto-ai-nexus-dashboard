
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradingBotConfig {
  id: string;
  strategy: string;
  target_symbols: string[];
  paper_balance: number;
  max_position_size: number;
  risk_level: string;
  ai_model: string;
}

interface MarketData {
  symbol: string;
  price_aud: number;
  change_24h: number;
  volume_24h_aud: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bot_id } = await req.json()

    // Fetch bot configuration
    const { data: bot, error: botError } = await supabaseClient
      .from('ai_trading_bots')
      .select('*')
      .eq('id', bot_id)
      .single()

    if (botError || !bot) {
      throw new Error('Bot not found')
    }

    // Fetch current market data for bot's target symbols
    const { data: marketData, error: marketError } = await supabaseClient
      .from('market_data_cache')
      .select('*')
      .in('symbol', bot.target_symbols)

    if (marketError) {
      throw new Error('Failed to fetch market data')
    }

    // Execute trading strategy based on bot configuration
    const tradingDecision = await executeStrategy(bot, marketData)

    // If decision is to trade, execute the paper trade
    if (tradingDecision.action !== 'hold') {
      const { error: tradeError } = await supabaseClient
        .from('paper_trades')
        .insert({
          user_id: bot.user_id,
          bot_id: bot.id,
          symbol: tradingDecision.symbol,
          side: tradingDecision.action,
          amount: tradingDecision.amount,
          price: tradingDecision.price,
          total_value: tradingDecision.amount * tradingDecision.price,
          reasoning: tradingDecision.reasoning,
          status: 'completed'
        })

      if (tradeError) {
        throw new Error('Failed to execute trade')
      }

      // Update bot performance metrics
      await updateBotPerformance(supabaseClient, bot.id, tradingDecision)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        decision: tradingDecision,
        bot_name: bot.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function executeStrategy(bot: TradingBotConfig, marketData: MarketData[]) {
  const strategy = bot.strategy.toLowerCase()
  
  switch (strategy) {
    case 'dca':
      return executeDCAStrategy(bot, marketData)
    case 'grid-trading':
      return executeGridStrategy(bot, marketData)
    case 'momentum':
      return executeMomentumStrategy(bot, marketData)
    case 'mean-reversion':
      return executeMeanReversionStrategy(bot, marketData)
    default:
      return {
        action: 'hold',
        reasoning: 'Unknown strategy type'
      }
  }
}

function executeDCAStrategy(bot: TradingBotConfig, marketData: MarketData[]) {
  // Simple DCA: Buy a fixed amount regularly regardless of price
  const targetSymbol = bot.target_symbols[0] || 'BTC'
  const symbolData = marketData.find(data => data.symbol === targetSymbol)
  
  if (!symbolData) {
    return { action: 'hold', reasoning: 'No market data available' }
  }

  const buyAmount = Math.min(bot.max_position_size * 0.1, bot.paper_balance * 0.05)
  
  return {
    action: 'buy',
    symbol: targetSymbol,
    amount: buyAmount / symbolData.price_aud,
    price: symbolData.price_aud,
    reasoning: `DCA strategy: Regular buy of ${buyAmount} AUD worth of ${targetSymbol}`
  }
}

function executeGridStrategy(bot: TradingBotConfig, marketData: MarketData[]) {
  const targetSymbol = bot.target_symbols[0] || 'BTC'
  const symbolData = marketData.find(data => data.symbol === targetSymbol)
  
  if (!symbolData) {
    return { action: 'hold', reasoning: 'No market data available' }
  }

  // Simplified grid logic: buy on dips, sell on peaks
  if (symbolData.change_24h < -3) {
    return {
      action: 'buy',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.2 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Grid strategy: Buying on ${symbolData.change_24h.toFixed(2)}% dip`
    }
  } else if (symbolData.change_24h > 5) {
    return {
      action: 'sell',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.1 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Grid strategy: Selling on ${symbolData.change_24h.toFixed(2)}% pump`
    }
  }

  return { action: 'hold', reasoning: 'Grid strategy: Price within normal range' }
}

function executeMomentumStrategy(bot: TradingBotConfig, marketData: MarketData[]) {
  const targetSymbol = bot.target_symbols[0] || 'BTC'
  const symbolData = marketData.find(data => data.symbol === targetSymbol)
  
  if (!symbolData) {
    return { action: 'hold', reasoning: 'No market data available' }
  }

  // Buy on strong positive momentum, sell on strong negative
  if (symbolData.change_24h > 8) {
    return {
      action: 'buy',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.3 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Momentum strategy: Strong uptrend at ${symbolData.change_24h.toFixed(2)}%`
    }
  } else if (symbolData.change_24h < -8) {
    return {
      action: 'sell',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.2 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Momentum strategy: Strong downtrend at ${symbolData.change_24h.toFixed(2)}%`
    }
  }

  return { action: 'hold', reasoning: 'Momentum strategy: Waiting for stronger signal' }
}

function executeMeanReversionStrategy(bot: TradingBotConfig, marketData: MarketData[]) {
  const targetSymbol = bot.target_symbols[0] || 'BTC'
  const symbolData = marketData.find(data => data.symbol === targetSymbol)
  
  if (!symbolData) {
    return { action: 'hold', reasoning: 'No market data available' }
  }

  // Buy on oversold, sell on overbought (opposite of momentum)
  if (symbolData.change_24h < -5) {
    return {
      action: 'buy',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.25 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Mean reversion: Oversold at ${symbolData.change_24h.toFixed(2)}%`
    }
  } else if (symbolData.change_24h > 10) {
    return {
      action: 'sell',
      symbol: targetSymbol,
      amount: bot.max_position_size * 0.15 / symbolData.price_aud,
      price: symbolData.price_aud,
      reasoning: `Mean reversion: Overbought at ${symbolData.change_24h.toFixed(2)}%`
    }
  }

  return { action: 'hold', reasoning: 'Mean reversion: Price within normal range' }
}

async function updateBotPerformance(supabaseClient: any, botId: string, decision: any) {
  // This would calculate and update the bot's performance metrics
  // For now, we'll just increment trade count
  const { error } = await supabaseClient.rpc('increment_bot_trades', {
    bot_id: botId
  })
  
  if (error) {
    console.error('Failed to update bot performance:', error)
  }
}
