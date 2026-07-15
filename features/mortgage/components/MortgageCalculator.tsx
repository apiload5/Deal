'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { formatPrice } from '@/lib/utils'

interface MortgageCalculatorProps {
  price?: number
}

export function MortgageCalculator({ price = 10000000 }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = React.useState(price)
  const [downPaymentPercent, setDownPaymentPercent] = React.useState(20)
  const [interestRate, setInterestRate] = React.useState(12)
  const [loanTerm, setLoanTerm] = React.useState(20)

  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100
  const loanAmount = propertyPrice - downPaymentAmount
  const monthlyInterestRate = interestRate / 12 / 100
  const numberOfPayments = loanTerm * 12

  let monthlyPayment = 0
  if (loanAmount > 0 && monthlyInterestRate > 0) {
    monthlyPayment =
      (loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  }

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - loanAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Property Price</Label>
          <Input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            className="font-medium"
          />
          <p className="text-sm text-muted-foreground">
            {formatPrice(propertyPrice)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Down Payment</Label>
            <span className="text-sm font-medium">{downPaymentPercent}%</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            min={5}
            max={50}
            step={5}
            onValueChange={(value) => setDownPaymentPercent(value[0] || 20)}
          />
          <p className="text-sm text-muted-foreground">
            Amount: {formatPrice(downPaymentAmount)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Interest Rate</Label>
            <span className="text-sm font-medium">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            min={5}
            max={25}
            step={0.5}
            onValueChange={(value) => setInterestRate(value[0] || 12)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Loan Term</Label>
            <span className="text-sm font-medium">{loanTerm} Years</span>
          </div>
          <Slider
            value={[loanTerm]}
            min={5}
            max={30}
            step={5}
            onValueChange={(value) => setLoanTerm(value[0] || 20)}
          />
        </div>

        <div className="mt-6 rounded-lg bg-primary/5 p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="font-medium">{formatPrice(loanAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Payment</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(Math.round(monthlyPayment))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Interest</span>
            <span className="font-medium">{formatPrice(Math.round(totalInterest))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Payment</span>
            <span className="font-medium">{formatPrice(Math.round(totalPayment))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
