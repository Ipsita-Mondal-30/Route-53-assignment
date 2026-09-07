"use client";

import { useUserSettings } from "@/lib/user-settings";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`hz-skeleton ${className}`} aria-hidden />;
}

export function SettingsPopoverSkeleton() {
  return (
    <div className="space-y-5 p-4" aria-busy="true" aria-label="Loading settings">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-44" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function HostedZoneDetailSkeleton() {
  return (
    <div className="-mx-4 -my-5 px-4 py-5 sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6" aria-busy="true">
      <span className="sr-only">Loading hosted zone</span>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Skeleton className="h-4 w-14 rounded-sm" />
          <Skeleton className="mt-3 h-8 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>
      </div>

      <Skeleton className="mb-5 h-12 w-full rounded-lg" />

      <div className="mb-4 flex gap-6 border-b border-[#414d5c] pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <Skeleton className="h-8 flex-1 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      <div className="space-y-0 border-t border-[#2a313c]">
        <div className="flex gap-4 border-b border-[#2a313c] py-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-4 border-b border-[#2a313c] py-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HostedZonesListSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading hosted zones</span>
      <div className="border-t border-[#545b64]">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-[#2a313c] px-3 py-4"
          >
            <Skeleton className="h-3.5 w-3.5" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConsoleBootSkeleton() {
  const { theme } = useUserSettings();
  return (
    <div
      className="aws-console flex h-dvh flex-col overflow-hidden bg-[#161d27]"
      data-theme={theme}
    >
      <div className="flex h-12 items-center gap-3 border-b border-[#232b37] bg-[#16191f] px-3">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-8 flex-1 max-w-[520px] rounded-md" />
        <Skeleton className="ml-auto h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="flex h-10 items-center gap-3 border-b border-[#232b37] bg-[#232f3e] px-3">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[280px] border-r border-[#2a313c] p-4 lg:block">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="mb-3 h-4 w-40" />
          ))}
        </div>
        <div className="min-w-0 flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-56" />
          <Skeleton className="mb-3 h-8 w-full" />
          <HostedZonesListSkeleton />
        </div>
      </div>
    </div>
  );
}
