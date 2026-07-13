'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPKR } from '@/lib/utils'

interface MortgageCalculatorProps {
  price?: number
}

export function MortgageCalculator({ price = 0 }: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(price)
  const [downPayment, setDownPayment] = useState(price * 0.2)
  const [interestRate, setInterestRate] = useState(15)
  const [loanTerm, setLoanTerm] = useState(20)

  const loanAmount = propertyPrice - downPayment
  const monthlyInterest = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12

  let monthlyPayment = 0
  if (loanAmount > 0 && monthlyInterest > 0) {
    monthlyPayment =
      loanAmount *
      (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1)
  }

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - loanAmount

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Mortgage Calculator</CardTitle>
        <CardDescription>
          Calculate your monthly payments and total cost
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Property Price</Label>
            <Input
              id="price"
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downPayment">Down Payment (20% recommended)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="text-right font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (Years)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="text-right font-medium"
            />
          </div>
        </div>

        <div className="grid gap-4 rounded-lg bg-primary/5 p-6 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly Payment</p>
            <p className="text-2xl font-bold text-primary">
              {formatPKR(Math.round(monthlyPayment))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Interest</p>
            <p className="text-2xl font-bold text-destructive">
              {formatPKR(Math.round(totalInterest))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Payment</p>
            <p className="text-2xl font-bold">
              {formatPKR(Math.round(totalPayment))}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">
            * This calculator provides an estimate only. Actual rates and terms may vary based on lender policies and your financial profile.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
