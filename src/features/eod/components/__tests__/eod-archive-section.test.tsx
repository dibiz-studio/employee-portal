import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EodArchiveSection } from "../eod-archive-section";

// Mock fetch globally
global.fetch = jest.fn();

describe("EodArchiveSection component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<EodArchiveSection year="2026" month="06" role="MANAGER" />);
    expect(screen.getByText("Archived — June 2026")).toBeInTheDocument();
    
    // MANAGER shouldn't see Export button
    expect(screen.queryByText("Export Excel")).not.toBeInTheDocument();
  });

  it("shows export button for HR and handles export click", async () => {
    // Mock blob and URL creation for export
    const mockBlob = new Blob(["mock-excel"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    });
    
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock anchor element securely
    const originalCreateElement = document.createElement.bind(document);
    let mockAnchor: HTMLAnchorElement;
    
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") {
        mockAnchor = el as HTMLAnchorElement;
        jest.spyOn(mockAnchor, "click").mockImplementation(() => {});
        return mockAnchor;
      }
      return el;
    });

    render(<EodArchiveSection year="2026" month="06" role="HR" />);
    
    const exportBtn = screen.getByText("Export Excel");
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);

    expect(global.fetch).toHaveBeenCalledWith("/api/eod/export?month=2026-06");

    await waitFor(() => {
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe("EOD_Archive_2026_06.xlsx");
    });
  });

  it("loads data when section is expanded", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        updates: [
          {
            id: "u1",
            report_date: "2026-06-01",
            employee_name: "Test Employee",
            hours_worked: 8,
            tasks_completed: ["Task 1", "Task 2"],
            reviewed_at: null,
          }
        ]
      }),
    });

    render(<EodArchiveSection year="2026" month="06" role="MANAGER" />);
    
    fireEvent.click(screen.getByText("Archived — June 2026"));

    expect(global.fetch).toHaveBeenCalledWith("/api/eod/archive?year=2026&month=06");

    await waitFor(() => {
      expect(screen.getByText("Test Employee")).toBeInTheDocument();
      expect(screen.getByText("8h")).toBeInTheDocument();
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText(/PENDING/i)).toBeInTheDocument();
    });
  });
});
