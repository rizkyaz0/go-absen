/**
 * StatsCard Component Tests
 */

import { render, screen } from "@testing-library/react"
import { StatsCard, AttendanceStatsCard } from "@/components/patterns/StatsCard"
import { Clock } from "lucide-react"

describe("StatsCard", () => {
  it("renders with basic props", () => {
    render(
      <StatsCard
        title="Total Users"
        value="1,234"
        description="Active users this month"
      />
    )

    expect(screen.getByText("Total Users")).toBeInTheDocument()
    expect(screen.getByText("1,234")).toBeInTheDocument()
    expect(screen.getByText("Active users this month")).toBeInTheDocument()
  })

  it("renders with icon", () => {
    render(
      <StatsCard
        title="Time"
        value="08:15"
        icon={Clock}
      />
    )

    expect(screen.getByText("Time")).toBeInTheDocument()
    expect(screen.getByText("08:15")).toBeInTheDocument()
    // Icon should be present (rendered as SVG)
    expect(document.querySelector("svg")).toBeInTheDocument()
  })

  it("renders with trend", () => {
    render(
      <StatsCard
        title="Growth"
        value="15%"
        trend={{
          value: 5.2,
          label: "vs last month",
          type: "positive",
        }}
      />
    )

    expect(screen.getByText("Growth")).toBeInTheDocument()
    expect(screen.getByText("15%")).toBeInTheDocument()
    expect(screen.getByText("+5.2%")).toBeInTheDocument()
    expect(screen.getByText("vs last month")).toBeInTheDocument()
  })

  it("renders loading state", () => {
    render(
      <StatsCard
        title="Loading"
        value="0"
        loading={true}
      />
    )

    // Should show skeleton elements
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("renders with different variants", () => {
    const { rerender } = render(
      <StatsCard
        title="Success"
        value="100%"
        variant="success"
      />
    )

    expect(screen.getByText("Success")).toBeInTheDocument()

    rerender(
      <StatsCard
        title="Warning"
        value="50%"
        variant="warning"
      />
    )

    expect(screen.getByText("Warning")).toBeInTheDocument()

    rerender(
      <StatsCard
        title="Error"
        value="0%"
        variant="destructive"
      />
    )

    expect(screen.getByText("Error")).toBeInTheDocument()
  })
})

describe("AttendanceStatsCard", () => {
  it("renders attendance statistics correctly", () => {
    render(
      <AttendanceStatsCard
        present={142}
        total={156}
      />
    )

    expect(screen.getByText("Attendance Rate")).toBeInTheDocument()
    expect(screen.getByText("91%")).toBeInTheDocument() // 142/156 * 100
    expect(screen.getByText("142 of 156 employees")).toBeInTheDocument()
  })

  it("handles zero total employees", () => {
    render(
      <AttendanceStatsCard
        present={0}
        total={0}
      />
    )

    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getByText("0 of 0 employees")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    render(
      <AttendanceStatsCard
        present={0}
        total={0}
        loading={true}
      />
    )

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("calculates trend correctly", () => {
    render(
      <AttendanceStatsCard
        present={150}
        total={156}
      />
    )

    // Should show positive trend (96% - 85% baseline = +11%)
    expect(screen.getByText("+11%")).toBeInTheDocument()
    expect(screen.getByText("vs last week")).toBeInTheDocument()
  })
})