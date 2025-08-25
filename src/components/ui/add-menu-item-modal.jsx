'use client'

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Label } from './label'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import { Select } from './select'
import { Switch } from './switch'
import { Slider } from './slider'
import { Card } from './card'
import { Badge } from './badge'
import { 
  Plus, 
  Upload, 
  X, 
  DollarSign, 
  Calculator, 
  ChefHat, 
  Leaf, 
  AlertTriangle,
  Star,
  Clock,
  Users,
  Flame,
  Zap,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  'Appetizers', 'Entrees', 'Desserts', 'Beverages', 'Specials', 'Sides'
]

const allergens = [
  'Gluten', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Soy', 'Sesame'
]

const dietaryTags = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'Organic', 'Local'
]

const spiceLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot']

export function AddMenuItemModal({ children, onAddItem }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Entrees',
    price: 0,
    cost: 0,
    preparationTime: 15,
    servingSize: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    spiceLevel: 'Mild',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    isLimitedTime: false,
    allergens: [],
    dietaryTags: [],
    ingredients: [],
    recipe: '',
    chefNotes: '',
    popularityScore: 50
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateProfitMargin = () => {
    const profit = formData.price - formData.cost
    return formData.price > 0 ? ((profit / formData.price) * 100).toFixed(1) : 0
  }

  const getMenuEngineeringCategory = () => {
    const profitMargin = parseFloat(calculateProfitMargin())
    const popularity = formData.popularityScore
    
    if (profitMargin >= 70 && popularity >= 70) return { label: 'Star', color: 'bg-yellow-500', icon: Star }
    if (profitMargin >= 70 && popularity < 70) return { label: 'Plow Horse', color: 'bg-blue-500', icon: TrendingUp }
    if (profitMargin < 70 && popularity >= 70) return { label: 'Puzzle', color: 'bg-orange-500', icon: AlertTriangle }
    return { label: 'Dog', color: 'bg-red-500', icon: X }
  }

  const handleSubmit = () => {
    const newItem = {
      ...formData,
      id: Date.now(),
      profit: formData.price - formData.cost,
      popularity: formData.popularityScore,
      image: imagePreview
    }
    onAddItem?.(newItem)
    setOpen(false)
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'Entrees',
      price: 0,
      cost: 0,
      preparationTime: 15,
      servingSize: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      spiceLevel: 'Mild',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: false,
      isLimitedTime: false,
      allergens: [],
      dietaryTags: [],
      ingredients: [],
      recipe: '',
      chefNotes: '',
      popularityScore: 50
    })
    setImagePreview(null)
  }

  const menuCategory = getMenuEngineeringCategory()
  const CategoryIcon = menuCategory.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Add New Menu Item
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-5 h-[600px]">
          {/* Left Panel - Form */}
          <div className="flex-1 overflow-y-auto pr-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="recipe">Recipe</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 pl-1">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter item name"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pl-1">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe this delicious item..."
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2 pl-1">
                  <Label>Item Image</Label>
                  <div 
                    className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-slate-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImagePreview(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                        <p className="text-slate-500">Click to upload image</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Quick Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Popular Item</Label>
                    <Switch 
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => handleInputChange('isPopular', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Limited Time</Label>
                    <Switch 
                      checked={formData.isLimitedTime}
                      onCheckedChange={(checked) => handleInputChange('isLimitedTime', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 pl-1">
                    <Label htmlFor="price">Selling Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost">Food Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>

                {/* Profit Analysis */}
                <Card className="p-4 bg-slate-800/50 border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profit Analysis</span>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Profit:</span>
                      <p className="font-semibold text-green-400">
                        ${(formData.price - formData.cost).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Margin:</span>
                      <p className="font-semibold text-blue-400">
                        {calculateProfitMargin()}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Category:</span>
                      <Badge className={cn('text-white', menuCategory.color)}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {menuCategory.label}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Popularity Prediction */}
                <div className="space-y-2">
                  <Label>Expected Popularity ({formData.popularityScore}%)</Label>
                  <Slider
                    value={[formData.popularityScore]}
                    onValueChange={([value]) => handleInputChange('popularityScore', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Low Demand</span>
                    <span>High Demand</span>
                  </div>
                </div>

                {/* Time & Service */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 pl-1">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value) || 15)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="servingSize">Serving Size</Label>
                    <Input
                      id="servingSize"
                      type="number"
                      value={formData.servingSize}
                      onChange={(e) => handleInputChange('servingSize', parseInt(e.target.value) || 1)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="space-y-4">
                {/* Nutritional Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 pl-1">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories}
                      onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={formData.protein}
                      onChange={(e) => handleInputChange('protein', parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2 pl-1">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => handleInputChange('carbs', parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={formData.fat}
                      onChange={(e) => handleInputChange('fat', parseFloat(e.target.value) || 0)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-3">
                  <Label>Dietary Options</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        Vegetarian
                      </Label>
                      <Switch 
                        checked={formData.isVegetarian}
                        onCheckedChange={(checked) => handleInputChange('isVegetarian', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        Vegan
                      </Label>
                      <Switch 
                        checked={formData.isVegan}
                        onCheckedChange={(checked) => handleInputChange('isVegan', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Gluten-Free</Label>
                      <Switch 
                        checked={formData.isGlutenFree}
                        onCheckedChange={(checked) => handleInputChange('isGlutenFree', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        Spicy
                      </Label>
                      <Switch 
                        checked={formData.isSpicy}
                        onCheckedChange={(checked) => handleInputChange('isSpicy', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Spice Level */}
                {formData.isSpicy && (
                  <div className="space-y-2">
                    <Label>Spice Level</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {spiceLevels.map(level => (
                        <Button
                          key={level}
                          variant={formData.spiceLevel === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange('spiceLevel', level)}
                          className="text-xs"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergen Information */}
                <div className="space-y-2">
                  <Label>Contains Allergens</Label>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map(allergen => (
                      <Badge
                        key={allergen}
                        variant={formData.allergens.includes(allergen) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = formData.allergens.includes(allergen)
                            ? formData.allergens.filter(a => a !== allergen)
                            : [...formData.allergens, allergen]
                          handleInputChange('allergens', updated)
                        }}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Recipe Tab */}
              <TabsContent value="recipe" className="space-y-4">
                <div className="space-y-2 pl-1">
                  <Label htmlFor="recipe">Recipe Instructions</Label>
                  <Textarea
                    id="recipe"
                    value={formData.recipe}
                    onChange={(e) => handleInputChange('recipe', e.target.value)}
                    placeholder="Enter detailed cooking instructions..."
                    className="bg-slate-800 border-slate-700 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2 pl-1">
                  <Label htmlFor="chefNotes">Chef's Notes</Label>
                  <Textarea
                    id="chefNotes"
                    value={formData.chefNotes}
                    onChange={(e) => handleInputChange('chefNotes', e.target.value)}
                    placeholder="Special notes, tips, or variations..."
                    className="bg-slate-800 border-slate-700 min-h-[80px]"
                  />
                </div>

                {/* Additional Tags */}
                <div className="space-y-2">
                  <Label>Additional Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={formData.dietaryTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = formData.dietaryTags.includes(tag)
                            ? formData.dietaryTags.filter(t => t !== tag)
                            : [...formData.dietaryTags, tag]
                          handleInputChange('dietaryTags', updated)
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-80 border-l border-slate-700 pl-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Preview
            </h3>
            
            <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Menu item" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Item Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg">
                    {formData.name || 'Item Name'}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {formData.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-300">
                  {formData.description || 'Item description will appear here...'}
                </p>
                
                {/* Price & Stats */}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-400">
                    ${formData.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formData.preparationTime}min
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {formData.isVegetarian && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20">
                      <Leaf className="w-3 h-3 mr-1" />
                      Vegetarian
                    </Badge>
                  )}
                  {formData.isSpicy && (
                    <Badge variant="secondary" className="text-xs bg-red-500/20">
                      <Flame className="w-3 h-3 mr-1" />
                      Spicy
                    </Badge>
                  )}
                  {formData.isPopular && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                
                {/* Nutrition Summary */}
                {formData.calories > 0 && (
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                    {formData.calories} calories | {formData.protein}g protein
                  </div>
                )}
                
                {/* Menu Engineering */}
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Menu Category:</span>
                    <Badge className={cn('text-white text-xs', menuCategory.color)}>
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {menuCategory.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || formData.price <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}