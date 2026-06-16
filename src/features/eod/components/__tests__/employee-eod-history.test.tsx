import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmployeeEodHistory } from "../employee-eod-history";

// Mock child component since it has its own test and fetches
jest.mock("../eod-archive-section", () => ({
  EodArchiveSection: ({ year, month }: { year: string; month: string }) => (
    <div data-testid="mock-archive">
      Archive {year}-{month}
    </div>
  ),
}));

describe("EmployeeEodHistory component", () => {
  type MockUpdate = {
    id: string;
    report_date: string;
    hours_worked: number;
    tasks_completed: string[];
    reviewed_at?: string | null;
    brand?: { name: string };
    blockers?: string | null;
  };

  it("renders empty state when no updates", () => {
    render(<EmployeeEodHistory employeeId="emp1" employeeName="John Doe" updates={[]} />);
    
    expect(screen.getByText("No EOD submissions")).toBeInTheDocument();
    expect(screen.getByText("John Doe has not submitted any EOD updates yet.")).toBeInTheDocument();
  });

  it("renders active month stats and table correctly", () => {
    const mockUpdates: MockUpdate[] = [
      {
        id: "u1",
        report_date: "2026-06-15",
        hours_worked: 8,
        tasks_completed: ["Task A"],
        reviewed_at: null,
      },
      {
        id: "u2",
        report_date: "2026-06-14",
        hours_worked: 7.5,
        tasks_completed: ["Task B"],
        reviewed_at: "2026-06-15T10:00:00Z",
        brand: { name: "Test Brand" },
        blockers: "Need API keys",
      },
    ];

    // Mock Date so format() gets the active month correct relative to the test data
    jest.useFakeTimers().setSystemTime(new Date("2026-06-16"));

    render(<EmployeeEodHistory employeeId="emp1" employeeName="John Doe" updates={mockUpdates} />);
    
    // Stats cards
    expect(screen.getByText("Submissions")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    
    expect(screen.getByText("Reviewed")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Only u2 is reviewed
    
    expect(screen.getByText("Total hours")).toBeInTheDocument();
    expect(screen.getByText("15.5h")).toBeInTheDocument();

    // Active table
    expect(screen.getByText(/Active EOD — June 2026/i)).toBeInTheDocument();
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
    expect(screen.getByText("Need API keys")).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it("renders archive sections for past months", () => {
    const mockUpdates: MockUpdate[] = [
      {
        id: "u1",
        report_date: "2026-06-15",
        hours_worked: 8,
        tasks_completed: ["Task A"],
      },
      {
        id: "u2",
        report_date: "2026-05-10", // Past month
        hours_worked: 8,
        tasks_completed: ["Task B"],
      },
      {
        id: "u3",
        report_date: "2026-04-05", // Past month
        hours_worked: 8,
        tasks_completed: ["Task C"],
      },
    ];

    jest.useFakeTimers().setSystemTime(new Date("2026-06-16"));

    render(<EmployeeEodHistory employeeId="emp1" employeeName="John Doe" updates={mockUpdates} />);
    
    // Check active month Task A is there
    expect(screen.getByText("Task A")).toBeInTheDocument();
    
    // Past months rendered as EodArchiveSection mock
    const archives = screen.getAllByTestId("mock-archive");
    expect(archives).toHaveLength(2);
    expect(screen.getByText("Archive 2026-05")).toBeInTheDocument();
    expect(screen.getByText("Archive 2026-04")).toBeInTheDocument();

    jest.useRealTimers();
  });
});
