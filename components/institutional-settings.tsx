"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Settings, School, Calculator } from "lucide-react"

interface InstitutionalSettingsProps {
  settings: {
    includeTransferInGPA: boolean
    separateTransferGPA: boolean
    coreSubjectsOnly: boolean
    honorsBonusPoints: number
    apBonusPoints: number
    rigorAdjustment: number
  }
  onSettingsChange: (settings: any) => void
}

export function InstitutionalSettings({ settings, onSettingsChange }: InstitutionalSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Institutional Settings
        </CardTitle>
        <CardDescription>Configure GPA calculation rules for your institution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfer GPA Settings */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <School className="mr-2 h-4 w-4" />
            Transfer Credit Policies
          </h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Transfer Credits in GPA</Label>
              <p className="text-sm text-gray-500">Whether transfer grades count toward institutional GPA</p>
            </div>
            <Switch
              checked={settings.includeTransferInGPA}
              onCheckedChange={(checked) => updateSetting("includeTransferInGPA", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintain Separate Transfer GPA</Label>
              <p className="text-sm text-gray-500">Track transfer GPA separately for advising</p>
            </div>
            <Switch
              checked={settings.separateTransferGPA}
              onCheckedChange={(checked) => updateSetting("separateTransferGPA", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Core Subjects Only</Label>
              <p className="text-sm text-gray-500">Only include core academic courses in GPA</p>
            </div>
            <Switch
              checked={settings.coreSubjectsOnly}
              onCheckedChange={(checked) => updateSetting("coreSubjectsOnly", checked)}
            />
          </div>
        </div>

        {/* Course Weighting */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <Calculator className="mr-2 h-4 w-4" />
            Course Weighting
          </h4>

          <div className="space-y-2">
            <Label>Honors Course Bonus Points</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[settings.honorsBonusPoints]}
                onValueChange={(value) => updateSetting("honorsBonusPoints", value[0])}
                max={1.0}
                min={0}
                step={0.1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.honorsBonusPoints}
                onChange={(e) => updateSetting("honorsBonusPoints", Number.parseFloat(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>AP/Advanced Course Bonus Points</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[settings.apBonusPoints]}
                onValueChange={(value) => updateSetting("apBonusPoints", value[0])}
                max={2.0}
                min={0}
                step={0.1}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.apBonusPoints}
                onChange={(e) => updateSetting("apBonusPoints", Number.parseFloat(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="2"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Institutional Rigor Adjustment</Label>
            <p className="text-sm text-gray-500">Adjust for institutional rigor differences (1.0 = no adjustment)</p>
            <div className="flex items-center space-x-4">
              <Slider
                value={[settings.rigorAdjustment]}
                onValueChange={(value) => updateSetting("rigorAdjustment", value[0])}
                max={1.5}
                min={0.5}
                step={0.05}
                className="flex-1"
              />
              <Input
                type="number"
                value={settings.rigorAdjustment}
                onChange={(e) => updateSetting("rigorAdjustment", Number.parseFloat(e.target.value) || 1.0)}
                className="w-20"
                min="0.5"
                max="1.5"
                step="0.05"
              />
            </div>
          </div>
        </div>

        {/* Credit Conversion Rules */}
        <div className="space-y-4">
          <h4 className="font-medium">Credit System Conversions</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Quarter → Semester</p>
              <p className="text-gray-600">Multiply by 0.67</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Trimester → Semester</p>
              <p className="text-gray-600">Multiply by 0.75</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
