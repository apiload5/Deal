// app/tools/area-converter/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Ruler } from 'lucide-react'

const areaUnits = {
  'sqft': { label: 'Square Feet', toSqft: 1 },
  'sqm': { label: 'Square Meters', toSqft: 10.764 },
  'marla': { label: 'Marla', toSqft: 272.25 },
  'kanal': { label: 'Kanal', toSqft: 5445 },
  'acre': { label: 'Acre', toSqft: 43560 },
}

export default function AreaConverter() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('sqft')
  const [toUnit, setToUnit] = useState('marla')

  const convert = () => {
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    const sqft = num * areaUnits[fromUnit as keyof typeof areaUnits].toSqft
    const result = sqft / areaUnits[toUnit as keyof typeof areaUnits].toSqft
    return result.toFixed(2)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Ruler className="h-8 w-8 text-green-600" />
            <CardTitle className="text-2xl">Area Unit Converter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Value</Label>
            <Input
              type="number"
              placeholder="Enter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(areaUnits).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(areaUnits).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {value && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Result</p>
              <p className="text-2xl font-bold text-green-600">
                {convert()} {areaUnits[toUnit as keyof typeof areaUnits].label}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
