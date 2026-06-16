import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SubmitEodForm } from "../submit-eod-form";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();

jest.mock("../../../../shared/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return { eq: mockEq };
      },
    }),
  }),
}));

const mockBrands = [
  { id: "b1", name: "Brand 1", created_at: "", updated_at: "" },
  { id: "b2", name: "Brand 2", created_at: "", updated_at: "" },
];

describe("SubmitEodForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
  });

  it("renders form correctly", () => {
    render(<SubmitEodForm employeeId="emp1" brands={mockBrands} />);
    expect(screen.getByText("Daily Update")).toBeInTheDocument();
    expect(screen.getByLabelText(/Hours Worked/i)).toBeInTheDocument();
    expect(screen.getByText("Add Task")).toBeInTheDocument();
    expect(screen.getByLabelText(/Blockers/i)).toBeInTheDocument();
  });

  it("submits new EOD successfully", async () => {
    mockSelect.mockResolvedValueOnce({ error: null });

    render(<SubmitEodForm employeeId="emp1" brands={mockBrands} defaultDate="2026-06-15" />);

    fireEvent.change(screen.getByPlaceholderText("Task 1"), { target: { value: "Did some work" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        employee_id: "emp1",
        report_date: "2026-06-15",
        brand_id: null,
        tasks_completed: ["Did some work"],
        hours_worked: 8,
        blockers: null,
        tomorrow_plan: null,
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("EOD submitted");
      expect(mockPush).toHaveBeenCalledWith("/eod/history");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("updates existing EOD successfully", async () => {
    mockSelect.mockResolvedValueOnce({ error: null });

    render(<SubmitEodForm employeeId="emp1" brands={mockBrands} existingId="eod1" defaultDate="2026-06-15" />);

    fireEvent.change(screen.getByPlaceholderText("Task 1"), { target: { value: "Updated task" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        employee_id: "emp1",
        report_date: "2026-06-15",
        brand_id: null,
        tasks_completed: ["Updated task"],
        hours_worked: 8,
        blockers: null,
        tomorrow_plan: null,
      });
      expect(mockEq).toHaveBeenCalledWith("id", "eod1");
      expect(mockToastSuccess).toHaveBeenCalledWith("EOD updated");
    });
  });

  it("shows error if submission fails", async () => {
    mockSelect.mockResolvedValueOnce({ error: new Error("DB error") });

    render(<SubmitEodForm employeeId="emp1" brands={mockBrands} />);

    fireEvent.change(screen.getByPlaceholderText("Task 1"), { target: { value: "Did some work" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("DB error");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
