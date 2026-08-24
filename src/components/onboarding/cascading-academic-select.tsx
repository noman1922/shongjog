"use client";

import { Building2, GraduationCap } from "lucide-react";
import { useMemo } from "react";

import type {
  DepartmentOption,
  UniversityOption,
} from "@/lib/onboarding/options";

interface CascadingAcademicSelectProps {
  universities: UniversityOption[];
  departments: DepartmentOption[];
  selectedUniversityId?: string;
  selectedDepartmentId?: string;
  onUniversityChange: (universityId: string) => void;
  onDepartmentChange: (departmentId: string) => void;
  universityError?: string;
  departmentError?: string;
}

const selectClass =
  "min-h-11 w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/40 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:bg-card dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground";
const labelClass = "text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5";
const errorClass = "text-xs text-destructive font-medium";

export function CascadingAcademicSelect({
  universities,
  departments,
  selectedUniversityId = "",
  selectedDepartmentId = "",
  onUniversityChange,
  onDepartmentChange,
  universityError,
  departmentError,
}: CascadingAcademicSelectProps) {
  const filteredDepartments = useMemo(() => {
    if (!selectedUniversityId) {
      return [];
    }
    return departments.filter(
      (dept) => dept.university_id === selectedUniversityId
    );
  }, [departments, selectedUniversityId]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* University Select */}
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="onboarding-university-select">
          <GraduationCap className="size-4 text-primary" />
          <span>University</span>
          <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <select
            className={`${selectClass} ${
              universityError ? "border-destructive/60" : ""
            }`}
            id="onboarding-university-select"
            onChange={(e) => {
              const newUni = e.target.value;
              onUniversityChange(newUni);
              onDepartmentChange("");
            }}
            value={selectedUniversityId}
          >
            <option value="">Select your university...</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.short_name
                  ? `${uni.name} (${uni.short_name})`
                  : uni.name}
              </option>
            ))}
          </select>
        </div>
        {universityError && <p className={errorClass}>{universityError}</p>}
      </div>

      {/* Department Select (Disabled if no university selected) */}
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="onboarding-department-select">
          <Building2 className="size-4 text-primary" />
          <span>Department</span>
          <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <select
            className={`${selectClass} ${
              departmentError ? "border-destructive/60" : ""
            } ${
              !selectedUniversityId
                ? "opacity-50 cursor-not-allowed bg-muted/20"
                : ""
            }`}
            disabled={!selectedUniversityId}
            id="onboarding-department-select"
            onChange={(e) => onDepartmentChange(e.target.value)}
            value={selectedDepartmentId}
          >
            <option value="">
              {!selectedUniversityId
                ? "First choose a university above"
                : filteredDepartments.length === 0
                ? "No departments available"
                : "Select your department..."}
            </option>
            {filteredDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.short_name
                  ? `${dept.name} (${dept.short_name})`
                  : dept.name}
              </option>
            ))}
          </select>
        </div>
        {departmentError ? (
          <p className={errorClass}>{departmentError}</p>
        ) : !selectedUniversityId ? (
          <p className="text-[11px] text-muted-foreground">
            Select a university to populate department options.
          </p>
        ) : null}
      </div>
    </div>
  );
}
