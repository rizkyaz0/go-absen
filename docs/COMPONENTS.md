# Components Documentation

## Overview

This document provides comprehensive documentation for all reusable components in the Go Absen design system.

## Component Categories

### 1. Layout Components

#### ResponsiveContainer
**Purpose**: Responsive wrapper with consistent max-width and padding
```tsx
<ResponsiveContainer maxWidth="2xl" padding="md">
  <Content />
</ResponsiveContainer>
```

**Props**:
- `maxWidth`: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
- `padding`: "none" | "sm" | "md" | "lg"
- `center`: boolean

#### ResponsiveGrid
**Purpose**: Responsive grid layout
```tsx
<ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
  <Item1 />
  <Item2 />
  <Item3 />
</ResponsiveGrid>
```

**Props**:
- `cols`: Responsive column configuration
- `gap`: "sm" | "md" | "lg"

### 2. Pattern Components

#### StatsCard
**Purpose**: Display key performance indicators
```tsx
<StatsCard
  title="Total Users"
  value="1,234"
  description="Active users this month"
  icon={Users}
  trend={{
    value: 5.2,
    label: "vs last month",
    type: "positive"
  }}
  variant="success"
/>
```

**Props**:
- `title`: string
- `value`: string | number
- `description?`: string
- `icon?`: LucideIcon
- `trend?`: Trend object
- `loading?`: boolean
- `variant?`: "default" | "success" | "warning" | "destructive"

#### WidgetCard
**Purpose**: Container for dashboard widgets
```tsx
<WidgetCard
  title="Chart Title"
  description="Chart description"
  actions={<Button>Export</Button>}
>
  <Chart />
</WidgetCard>
```

**Props**:
- `title?`: string
- `description?`: string
- `actions?`: ReactNode
- `children`: ReactNode

#### ActivityTimeline
**Purpose**: Display timeline of activities
```tsx
<ActivityTimeline
  activities={[
    {
      id: "1",
      title: "Check-in successful",
      description: "Checked in at 08:15",
      timestamp: "2 hours ago",
      type: "success"
    }
  ]}
  loading={false}
/>
```

**Props**:
- `activities`: Activity array
- `loading?`: boolean

### 3. Form Components

#### FormInput
**Purpose**: Input field with validation
```tsx
<FormInput
  label="Email Address"
  placeholder="Enter your email"
  type="email"
  required
  error={errors.email?.message}
  hint="We'll never share your email"
/>
```

**Props**:
- `label?`: string
- `error?`: string
- `hint?`: string
- `required?`: boolean
- All standard input props

#### FormSelect
**Purpose**: Select dropdown with validation
```tsx
<FormSelect
  label="Department"
  placeholder="Select department"
  options={[
    { value: "engineering", label: "Engineering" },
    { value: "marketing", label: "Marketing" }
  ]}
  value={selectedDept}
  onValueChange={setSelectedDept}
  required
/>
```

**Props**:
- `label?`: string
- `error?`: string
- `hint?`: string
- `required?`: boolean
- `placeholder?`: string
- `options`: Option array
- `value?`: string
- `onValueChange?`: (value: string) => void

#### FormCheckbox
**Purpose**: Checkbox with validation
```tsx
<FormCheckbox
  label="I agree to the terms"
  checked={agreed}
  onCheckedChange={setAgreed}
  required
/>
```

**Props**:
- `label?`: string
- `error?`: string
- `hint?`: string
- `required?`: boolean
- All standard checkbox props

### 4. Chart Components

#### ChartContainer
**Purpose**: Wrapper for data visualization
```tsx
<ChartContainer
  title="Attendance Trend"
  description="7-day attendance overview"
  onRefresh={() => refetch()}
  onExport={() => exportChart()}
  timeRange={{
    value: "7d",
    onChange: setTimeRange,
    options: timeRangeOptions
  }}
  loading={isLoading}
  error={error}
>
  <LineChart data={chartData} />
</ChartContainer>
```

**Props**:
- `title`: string
- `description?`: string
- `loading?`: boolean
- `error?`: string
- `onRefresh?`: () => void
- `onExport?`: () => void
- `onSettings?`: () => void
- `timeRange?`: TimeRange object
- `height?`: string | number

### 5. Loading Components

#### Skeleton
**Purpose**: Loading placeholder
```tsx
<Skeleton className="h-4 w-32" />
```

#### PageSkeleton
**Purpose**: Full page loading state
```tsx
<PageSkeleton />
```

#### CardSkeleton
**Purpose**: Card loading state
```tsx
<CardSkeleton />
```

#### TableSkeleton
**Purpose**: Table loading state
```tsx
<TableSkeleton rows={5} columns={4} />
```

### 6. Error Components

#### ErrorBoundary
**Purpose**: Catch and display errors
```tsx
<ErrorBoundary
  fallback={CustomErrorFallback}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo)
  }}
>
  <App />
</ErrorBoundary>
```

**Props**:
- `fallback?`: React component
- `onError?`: (error: Error, errorInfo: ErrorInfo) => void

## Usage Patterns

### 1. Dashboard Layout
```tsx
function Dashboard() {
  return (
    <ErrorBoundary>
      <ResponsiveDashboard>
        <KpiRow>
          <StatsCard title="Users" value="1,234" />
          <StatsCard title="Revenue" value="$12,345" />
        </KpiRow>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WidgetCard title="Chart">
              <ChartContainer>
                <LineChart data={data} />
              </ChartContainer>
            </WidgetCard>
          </div>
          
          <div>
            <WidgetCard title="Activities">
              <ActivityTimeline activities={activities} />
            </WidgetCard>
          </div>
        </div>
      </ResponsiveDashboard>
    </ErrorBoundary>
  )
}
```

### 2. Form Layout
```tsx
function UserForm() {
  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Personal Information">
        <FormInput
          label="Full Name"
          {...register("name")}
          error={errors.name?.message}
          required
        />
        
        <FormInput
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          required
        />
      </FormSection>
      
      <FormSection title="Work Information">
        <FormSelect
          label="Department"
          options={departmentOptions}
          {...register("department")}
          error={errors.department?.message}
          required
        />
      </FormSection>
      
      <FormActions>
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline">Cancel</Button>
      </FormActions>
    </form>
  )
}
```

### 3. Data Display
```tsx
function DataTable() {
  return (
    <WidgetCard
      title="Employees"
      actions={
        <Button onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      }
    >
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Table>
            {/* Table content */}
          </Table>
        </TabsContent>
      </Tabs>
    </WidgetCard>
  )
}
```

## Styling Guidelines

### 1. Design Tokens
Always use design tokens instead of hardcoded values:
```tsx
// ✅ Good
<div className="bg-background text-foreground border border-border p-4 rounded-lg">

// ❌ Bad
<div className="bg-white text-black border border-gray-300 p-4 rounded-lg">
```

### 2. Responsive Design
Use responsive utilities for different screen sizes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 md:col-span-2 lg:col-span-1">
    Content
  </div>
</div>
```

### 3. Accessibility
Include proper ARIA attributes and semantic HTML:
```tsx
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={toggle}
>
  <X className="h-4 w-4" />
</button>
```

## Testing

### 1. Unit Tests
Test component rendering and behavior:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsCard } from '@/components/patterns/StatsCard'

test('renders stats card with title and value', () => {
  render(<StatsCard title="Users" value="1,234" />)
  
  expect(screen.getByText('Users')).toBeInTheDocument()
  expect(screen.getByText('1,234')).toBeInTheDocument()
})
```

### 2. Integration Tests
Test component interactions:
```tsx
test('handles form submission', async () => {
  const handleSubmit = jest.fn()
  
  render(<UserForm onSubmit={handleSubmit} />)
  
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'John Doe' }
  })
  
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe'
  })
})
```

## Best Practices

### 1. Component Design
- Keep components focused and single-purpose
- Use TypeScript for type safety
- Provide sensible defaults
- Make components accessible by default

### 2. Props Design
- Use optional props with defaults
- Provide clear prop types
- Use discriminated unions for variants
- Keep props API stable

### 3. Performance
- Use React.memo for expensive components
- Implement proper loading states
- Use lazy loading for heavy components
- Optimize re-renders

### 4. Accessibility
- Include ARIA labels
- Support keyboard navigation
- Ensure proper color contrast
- Test with screen readers

## Migration Guide

### Updating Components
1. Check breaking changes in changelog
2. Update import paths if needed
3. Update prop names if changed
4. Test component behavior
5. Update documentation

### Deprecation Policy
- Components marked as deprecated will be removed in next major version
- Deprecated components will show console warnings
- Migration guides provided for deprecated components
- 6-month notice before removal

## Support

### Resources
- Component Storybook (if available)
- Design system documentation
- Code examples and snippets
- Video tutorials

### Getting Help
- Check component documentation
- Review code examples
- Test in isolation
- Ask development team