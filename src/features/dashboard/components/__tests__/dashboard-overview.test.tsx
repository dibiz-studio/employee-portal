import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DashboardOverview } from "../dashboard-overview";
import type { DashboardStats } from "../../../services/dashboard.service";

const mockStats: DashboardStats = {
  pendingOnboarding: 5,
  totalEmployees: 100,
  pendingLeaves: 12,
  activeKpis: 8,
  kpiAtRisk: 2,
  departments: 4,
  unreadNotifications: 3,
};

describe("DashboardOverview component", () => {
  it("renders SUPER_ADMIN stats correctly", () => {
    render(<DashboardOverview role="SUPER_ADMIN" stats={mockStats} />);
    
    expect(screen.getByText("Overview")).toBeInTheDocument();
    
    expect(screen.getByText("Pending Onboarding")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    
    expect(screen.getByText("Pending Leaves")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    
    expect(screen.getByText("Active KPIs")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    
    expect(screen.getByText("KPIs at Risk")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    
    expect(screen.getByText("Departments")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    
    expect(screen.getByText("Unread Notifications")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders HR stats correctly", () => {
    render(<DashboardOverview role="HR" stats={mockStats} />);
    
    expect(screen.getByText("Pending Onboarding")).toBeInTheDocument();
    expect(screen.getByText("Departments")).toBeInTheDocument();
    expect(screen.queryByText("KPIs at Risk")).not.toBeInTheDocument(); // HR doesn't see KPIs at Risk in config
  });

  it("renders MANAGER stats correctly", () => {
    render(<DashboardOverview role="MANAGER" stats={mockStats} />);
    
    expect(screen.getByText("Team Members")).toBeInTheDocument(); // For manager, totalEmployees maps to "Team Members"
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("KPIs at Risk")).toBeInTheDocument();
    expect(screen.queryByText("Pending Onboarding")).not.toBeInTheDocument();
  });

  it("renders EMPLOYEE stats correctly", () => {
    render(<DashboardOverview role="EMPLOYEE" stats={mockStats} />);
    
    expect(screen.getByText("Pending Leaves")).toBeInTheDocument();
    expect(screen.getByText("Active KPIs")).toBeInTheDocument();
    expect(screen.queryByText("Total Employees")).not.toBeInTheDocument();
    expect(screen.queryByText("Pending Onboarding")).not.toBeInTheDocument();
  });

  it("renders INTERN stats correctly", () => {
    render(<DashboardOverview role="INTERN" stats={mockStats} />);
    
    expect(screen.getByText("Pending Leaves")).toBeInTheDocument();
    expect(screen.getByText("Active KPIs")).toBeInTheDocument();
    expect(screen.queryByText("KPIs at Risk")).not.toBeInTheDocument();
  });
});
