import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoginForm } from "../login-form";

// Mock dependencies
const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockGetSearchParam = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: mockGetSearchParam,
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

const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockFetchProfile = jest.fn();

jest.mock("../../services/auth.service", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  fetchProfile: (...args: unknown[]) => mockFetchProfile(...args),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSearchParam.mockReturnValue(null);
  });

  it("renders correctly", () => {
    render(<LoginForm />);
    expect(screen.getByText("Enter your credentials to access the HRMS portal")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    
    await waitFor(() => {
      expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("handles successful sign in and redirects to onboarding if not completed", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { id: "u1" } });
    mockFetchProfile.mockResolvedValueOnce({ onboarding_status: "PENDING" });
    mockGetSearchParam.mockReturnValue("test-invite");

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockToastSuccess).toHaveBeenCalledWith("Signed in successfully");
      expect(mockPush).toHaveBeenCalledWith("/onboarding?invite=test-invite");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("handles successful sign in and redirects to dashboard if onboarding is completed", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { id: "u1" } });
    mockFetchProfile.mockResolvedValueOnce({ onboarding_status: "COMPLETED" });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles sign in error", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Invalid credentials");
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("handles google sign in", async () => {
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);

    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole("button", { name: /sign in with google/i }));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledWith(undefined);
    });
  });

  it("handles google sign in error", async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(new Error("Google error"));

    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole("button", { name: /sign in with google/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Google error");
    });
  });
});
