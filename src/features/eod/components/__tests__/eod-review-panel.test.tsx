import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EodReviewPanel } from "../eod-review-panel";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
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

const mockUpdate = jest.fn();
const mockEq = jest.fn();

jest.mock("../../../../shared/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return { eq: mockEq };
      },
    }),
  }),
}));

type MockUpdate = {
  id: string;
  employee_id: string;
  employee_name: string;
  report_date: string;
  hours_worked: number;
  tasks_completed: string[];
  brand?: { name: string };
  blockers?: string | null;
};

describe("EodReviewPanel", () => {
beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  it("renders empty state", () => {
    render(<EodReviewPanel updates={[]} reviewerId="mgr1" />);
    expect(screen.getByText("No team EOD submissions to review.")).toBeInTheDocument();
  });

  it("renders table and handles successful review", async () => {
    mockEq.mockResolvedValueOnce({ error: null });

    const mockUpdates: MockUpdate[] = [
      {
        id: "u1",
        employee_id: "emp1",
        employee_name: "Jane Doe",
        report_date: "2026-06-15",
        hours_worked: 8,
        tasks_completed: ["Finished project"],
        brand: { name: "Test Brand" },
      },
    ];

    render(<EodReviewPanel updates={mockUpdates} reviewerId="mgr1" />);
    
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Test Brand")).toBeInTheDocument();
    expect(screen.getByText("Finished project")).toBeInTheDocument();

    const commentInput = screen.getByPlaceholderText("Manager comment");
    fireEvent.change(commentInput, { target: { value: "Great work!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Save Review" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          manager_comment: "Great work!",
          reviewed_by: "mgr1",
        })
      );
      expect(mockEq).toHaveBeenCalledWith("id", "u1");
      expect(mockToastSuccess).toHaveBeenCalledWith("Review saved");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("handles review error", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("DB Error") });

    const mockUpdates: MockUpdate[] = [
      {
        id: "u1",
        employee_id: "emp1",
        employee_name: "Jane Doe",
        report_date: "2026-06-15",
        hours_worked: 8,
        tasks_completed: ["Task"],
      },
    ];

    render(<EodReviewPanel updates={mockUpdates} reviewerId="mgr1" />);
    
    fireEvent.click(screen.getByRole("button", { name: "Save Review" }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("DB Error");
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
